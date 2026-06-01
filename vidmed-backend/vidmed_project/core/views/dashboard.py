from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from core.permissions import IsManagerOrAbove, CanViewHistory
from core.models import Clinic, DailyReport, Expense, Debt, CompanyDebt, Alert
from core.serializers import DashboardStatsSerializer, CashFlowSerializer
from services.cache_service import CacheService


@api_view(['GET'])
@permission_classes([IsManagerOrAbove])
def dashboard_view(request, clinic_id):
    """
    Tableau de bord principal avec statistiques
    Cache: 5 minutes
    """
    # Vérifier permissions
    if request.user.role == 'manager' and request.user.clinic_id != clinic_id:
        return Response(
            {'detail': 'Vous n\'avez pas accès à cette clinique'},
            status=status.HTTP_403_FORBIDDEN
        )

    def calculate_dashboard():
        today = timezone.now().date()
        month_start = today.replace(day=1)

        # Revenus du mois
        reports = DailyReport.objects.filter(
            clinic_id=clinic_id,
            report_date__gte=month_start,
            report_date__lte=today
        )
        total_revenue = sum(report.total_revenue for report in reports)

        # Dépenses du mois
        expenses = Expense.objects.filter(
            clinic_id=clinic_id,
            expense_date__gte=month_start,
            expense_date__lte=today
        )
        total_expenses = sum(expense.amount for expense in expenses)

        # Résultat net
        net_result = total_revenue - total_expenses

        # Solde de trésorerie (simplifié - calculé depuis début du mois)
        cash_balance = net_result

        # Dettes patients (créances)
        patient_debts = Debt.objects.filter(
            clinic_id=clinic_id,
            is_paid=False
        )
        total_patient_debts = sum(debt.remaining_amount for debt in patient_debts)

        # Dettes entreprise (passif)
        company_debts = CompanyDebt.objects.filter(
            clinic_id=clinic_id,
            is_paid=False
        )
        total_company_debts = sum(debt.remaining_amount for debt in company_debts)

        # Rapports manquants ce mois
        days_in_month = (today - month_start).days + 1
        existing_reports = reports.count()
        missing_reports_count = max(0, days_in_month - existing_reports)

        # Dettes en retard
        overdue_debts_count = patient_debts.filter(due_date__lt=today).count()

        return {
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'net_result': net_result,
            'cash_balance': cash_balance,
            'total_patient_debts': total_patient_debts,
            'total_company_debts': total_company_debts,
            'missing_reports_count': missing_reports_count,
            'overdue_debts_count': overdue_debts_count,
        }

    # Utiliser cache
    cache_key = f'dashboard:{clinic_id}:{timezone.now().date()}'
    data = CacheService.get_or_set(
        cache_key,
        calculate_dashboard,
        timeout=CacheService.TTL_DASHBOARD
    )

    serializer = DashboardStatsSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsManagerOrAbove])
def cash_flow_view(request, clinic_id):
    """
    Flux de trésorerie à partir de la vue cash_flow_view
    Cache: 10 minutes
    """
    # Vérifier permissions
    if request.user.role == 'manager' and request.user.clinic_id != clinic_id:
        return Response(
            {'detail': 'Vous n\'avez pas accès à cette clinique'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Paramètres de filtrage
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    flow_type = request.GET.get('flow_type')  # 'in' ou 'out'
    account_code_id = request.GET.get('account_code_id')

    def get_cash_flow():
        # Requête SQL directe sur la vue
        query = """
            SELECT
                source,
                source_detail,
                source_id,
                clinic_id,
                transaction_date,
                account_code_id,
                ac.code as account_code_code,
                ac.name as account_code_name,
                flow_type,
                amount,
                user_id,
                CONCAT(u.first_name, ' ', u.last_name) as user_name,
                description,
                created_at
            FROM cash_flow_view cfv
            LEFT JOIN account_codes ac ON cfv.account_code_id = ac.id
            LEFT JOIN users u ON cfv.user_id = u.id
            WHERE clinic_id = %s
        """
        params = [clinic_id]

        if start_date:
            query += " AND transaction_date >= %s"
            params.append(start_date)

        if end_date:
            query += " AND transaction_date <= %s"
            params.append(end_date)

        if flow_type:
            query += " AND flow_type = %s"
            params.append(flow_type)

        if account_code_id:
            query += " AND account_code_id = %s"
            params.append(account_code_id)

        query += " ORDER BY transaction_date DESC, created_at DESC LIMIT 1000"

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return results

    # Cache avec paramètres
    cache_key = f'cash_flow:{clinic_id}:{start_date}:{end_date}:{flow_type}:{account_code_id}'
    data = CacheService.get_or_set(
        cache_key,
        get_cash_flow,
        timeout=CacheService.TTL_STATS
    )

    serializer = CashFlowSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([CanViewHistory])
def history_view(request, model_name, object_id):
    """
    Obtenir l'historique d'un objet (django-simple-history)
    Superuser et Grand Superuser uniquement
    """
    from django.apps import apps
    from django.core.exceptions import ObjectDoesNotExist

    try:
        # Obtenir le modèle
        model = apps.get_model('core', model_name)

        # Vérifier que le modèle a de l'historique
        if not hasattr(model, 'history'):
            return Response(
                {'detail': 'Ce modèle n\'a pas d\'historique'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtenir l'objet
        obj = model.objects.get(pk=object_id)

        # Obtenir l'historique
        history = obj.history.all()

        history_data = []
        for record in history:
            history_data.append({
                'history_id': record.history_id,
                'history_date': record.history_date,
                'history_type': record.get_history_type_display(),
                'history_user': record.history_user.username if record.history_user else None,
                'data': record.__dict__
            })

        return Response({
            'model': model_name,
            'object_id': object_id,
            'history': history_data
        })

    except ObjectDoesNotExist:
        return Response(
            {'detail': 'Objet non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
