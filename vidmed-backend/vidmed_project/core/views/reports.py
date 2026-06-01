from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.db.models import Sum
from datetime import datetime
from decimal import Decimal

from core.permissions import IsSuperuserOrAbove, IsManagerOrAbove
from core.models import Clinic, DailyReport, Expense, AccountCode
from core.serializers import PeriodComparisonSerializer
from services.cache_service import CacheService


@api_view(['GET'])
@permission_classes([IsManagerOrAbove])
def period_comparison_view(request, clinic_id):
    """
    Comparaison période N vs période N-1
    Cache: 30 minutes
    """
    # Vérifier permissions
    if request.user.role == 'manager' and request.user.clinic_id != clinic_id:
        return Response(
            {'detail': 'Vous n\'avez pas accès à cette clinique'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Paramètres
    start1 = request.GET.get('start1')  # Début période 1
    end1 = request.GET.get('end1')      # Fin période 1
    start2 = request.GET.get('start2')  # Début période 2
    end2 = request.GET.get('end2')      # Fin période 2

    if not all([start1, end1, start2, end2]):
        return Response(
            {'detail': 'Paramètres requis: start1, end1, start2, end2 (format: YYYY-MM-DD)'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def calculate_period_data(start_date, end_date):
        """Calculer les données pour une période"""
        # Revenus
        reports = DailyReport.objects.filter(
            clinic_id=clinic_id,
            report_date__gte=start_date,
            report_date__lte=end_date
        )
        total_revenue = sum(report.total_revenue for report in reports)

        # Dépenses
        expenses = Expense.objects.filter(
            clinic_id=clinic_id,
            expense_date__gte=start_date,
            expense_date__lte=end_date
        )
        total_expenses = sum(expense.amount for expense in expenses)

        # Résultat net
        net_result = total_revenue - total_expenses

        return {
            'revenue': total_revenue,
            'expenses': total_expenses,
            'net': net_result
        }

    def compare_periods():
        period1 = calculate_period_data(start1, end1)
        period2 = calculate_period_data(start2, end2)

        # Calcul des variations en pourcentage
        def calc_variation(old, new):
            if old == 0:
                return 100.0 if new > 0 else 0.0
            return ((new - old) / old) * 100

        revenue_var = calc_variation(period1['revenue'], period2['revenue'])
        expenses_var = calc_variation(period1['expenses'], period2['expenses'])
        net_var = calc_variation(period1['net'], period2['net'])

        # Analyse qualitative
        if net_var > 10:
            analysis = "📈 Forte amélioration du résultat net"
        elif net_var > 0:
            analysis = "📊 Légère amélioration du résultat net"
        elif net_var > -10:
            analysis = "📉 Légère baisse du résultat net"
        else:
            analysis = "⚠️ Forte baisse du résultat net"

        return {
            'period1_label': f"{start1} au {end1}",
            'period1_revenue': period1['revenue'],
            'period1_expenses': period1['expenses'],
            'period1_net': period1['net'],
            'period2_label': f"{start2} au {end2}",
            'period2_revenue': period2['revenue'],
            'period2_expenses': period2['expenses'],
            'period2_net': period2['net'],
            'revenue_variation': round(revenue_var, 2),
            'expenses_variation': round(expenses_var, 2),
            'net_variation': round(net_var, 2),
            'analysis': analysis
        }

    # Cache
    cache_key = f'comparison:{clinic_id}:{start1}:{end1}:{start2}:{end2}'
    data = CacheService.get_or_set(
        cache_key,
        compare_periods,
        timeout=CacheService.TTL_MONTHLY
    )

    serializer = PeriodComparisonSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsSuperuserOrAbove])
def balance_generale_view(request, clinic_id):
    """
    Balance générale (optionnel: format légal SYSCOHADA)
    Superuser et Grand Superuser uniquement
    """
    # Paramètres
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    format_type = request.GET.get('format', 'simple')  # 'simple' ou 'legal'

    if not start_date or not end_date:
        return Response(
            {'detail': 'Paramètres requis: start_date, end_date'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Requête pour obtenir tous les mouvements par code de compte
    query = """
        SELECT
            ac.id,
            ac.code,
            ac.name,
            ac.account_type,
            ac.legal_code,
            ac.legal_name,
            SUM(CASE WHEN cfv.flow_type = 'in' THEN cfv.amount ELSE 0 END) as total_debit,
            SUM(CASE WHEN cfv.flow_type = 'out' THEN cfv.amount ELSE 0 END) as total_credit,
            SUM(CASE WHEN cfv.flow_type = 'in' THEN cfv.amount ELSE -cfv.amount END) as solde
        FROM cash_flow_view cfv
        JOIN account_codes ac ON cfv.account_code_id = ac.id
        WHERE cfv.clinic_id = %s
        AND cfv.transaction_date >= %s
        AND cfv.transaction_date <= %s
        GROUP BY ac.id, ac.code, ac.name, ac.account_type, ac.legal_code, ac.legal_name
        ORDER BY ac.code
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [clinic_id, start_date, end_date])
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

    if format_type == 'legal':
        # Grouper par code légal SYSCOHADA
        legal_balance = {}
        for row in results:
            legal_code = row['legal_code'] or 'N/A'
            legal_name = row['legal_name'] or row['name']

            if legal_code not in legal_balance:
                legal_balance[legal_code] = {
                    'legal_code': legal_code,
                    'legal_name': legal_name,
                    'total_debit': Decimal('0.00'),
                    'total_credit': Decimal('0.00'),
                    'solde': Decimal('0.00')
                }

            legal_balance[legal_code]['total_debit'] += row['total_debit']
            legal_balance[legal_code]['total_credit'] += row['total_credit']
            legal_balance[legal_code]['solde'] += row['solde']

        results = list(legal_balance.values())

    return Response({
        'clinic_id': clinic_id,
        'start_date': start_date,
        'end_date': end_date,
        'format': format_type,
        'balance': results,
        'total_debit': sum(r['total_debit'] for r in results),
        'total_credit': sum(r['total_credit'] for r in results),
    })


@api_view(['GET'])
@permission_classes([IsSuperuserOrAbove])
def grand_livre_view(request, clinic_id):
    """
    Grand livre - Détail de toutes les transactions par compte
    Superuser et Grand Superuser uniquement
    """
    # Paramètres
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    account_code_id = request.GET.get('account_code_id')  # Optionnel

    if not start_date or not end_date:
        return Response(
            {'detail': 'Paramètres requis: start_date, end_date'},
            status=status.HTTP_400_BAD_REQUEST
        )

    query = """
        SELECT
            cfv.transaction_date,
            ac.code as account_code,
            ac.name as account_name,
            cfv.source,
            cfv.source_detail,
            cfv.description,
            CASE WHEN cfv.flow_type = 'in' THEN cfv.amount ELSE 0 END as debit,
            CASE WHEN cfv.flow_type = 'out' THEN cfv.amount ELSE 0 END as credit,
            u.username as user
        FROM cash_flow_view cfv
        LEFT JOIN account_codes ac ON cfv.account_code_id = ac.id
        LEFT JOIN users u ON cfv.user_id = u.id
        WHERE cfv.clinic_id = %s
        AND cfv.transaction_date >= %s
        AND cfv.transaction_date <= %s
    """
    params = [clinic_id, start_date, end_date]

    if account_code_id:
        query += " AND cfv.account_code_id = %s"
        params.append(account_code_id)

    query += " ORDER BY ac.code, cfv.transaction_date DESC"

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Grouper par compte
    accounts = {}
    for row in results:
        code = row['account_code']
        if code not in accounts:
            accounts[code] = {
                'account_code': code,
                'account_name': row['account_name'],
                'transactions': [],
                'total_debit': Decimal('0.00'),
                'total_credit': Decimal('0.00'),
                'solde': Decimal('0.00')
            }

        accounts[code]['transactions'].append(row)
        accounts[code]['total_debit'] += row['debit']
        accounts[code]['total_credit'] += row['credit']
        accounts[code]['solde'] += (row['debit'] - row['credit'])

    return Response({
        'clinic_id': clinic_id,
        'start_date': start_date,
        'end_date': end_date,
        'accounts': list(accounts.values())
    })
