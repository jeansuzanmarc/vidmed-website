from celery import shared_task
from django.utils import timezone
from django.db.models import Sum, Q
from datetime import timedelta, date
from decimal import Decimal
import logging

from .models import Clinic, DailyReport, Alert, Debt, CompanyDebt, User
from services.whatsapp_service import whatsapp_service
from services.notification_service import notification_service
from django.core.cache import cache

logger = logging.getLogger(__name__)


@shared_task
def check_missing_reports():
    """
    Vérifier les rapports journaliers manquants (exécuté à 20h00 chaque jour)
    """
    today = timezone.now().date()
    clinics = Clinic.objects.filter(is_active=True)

    for clinic in clinics:
        # Vérifier si le rapport existe pour aujourd'hui
        report_exists = DailyReport.objects.filter(
            clinic=clinic,
            report_date=today
        ).exists()

        if not report_exists:
            # Créer une alerte
            alert = Alert.objects.create(
                clinic=clinic,
                alert_type='missing_report',
                alert_level='warning',
                alert_date=today,
                message=f"Rapport journalier manquant pour le {today.strftime('%d/%m/%Y')}"
            )

            # Envoyer notification au manager de la clinique
            managers = clinic.users.filter(role='manager', is_active=True)
            for manager in managers:
                if manager.phone:
                    success = whatsapp_service.send_missing_report_alert(
                        phone=manager.phone,
                        clinic_name=clinic.name,
                        date=today.strftime('%d/%m/%Y')
                    )
                    if success:
                        alert.whatsapp_sent = True
                        alert.whatsapp_sent_at = timezone.now()
                        alert.save()

                # Notification push
                notification_service.send_missing_report_notification(
                    user=manager,
                    clinic_name=clinic.name,
                    date=today.strftime('%d/%m/%Y')
                )

            logger.info(f"Missing report alert created for {clinic.name} on {today}")

    return f"Checked {clinics.count()} clinics for missing reports"


@shared_task
def check_unpaid_debts():
    """
    Vérifier les dettes impayées en retard (exécuté le lundi à 9h00)
    """
    today = timezone.now().date()

    # Dettes patients en retard
    overdue_debts = Debt.objects.filter(
        is_paid=False,
        due_date__lt=today
    ).select_related('clinic', 'created_by')

    alert_count = 0
    for debt in overdue_debts:
        days_overdue = (today - debt.due_date).days

        # Créer alerte si pas déjà créée cette semaine
        existing_alert = Alert.objects.filter(
            clinic=debt.clinic,
            alert_type='overdue_debt',
            alert_date__gte=today - timedelta(days=7),
            message__contains=debt.debtor_name
        ).exists()

        if not existing_alert:
            alert = Alert.objects.create(
                clinic=debt.clinic,
                alert_type='overdue_debt',
                alert_level='warning',
                alert_date=today,
                message=f"Dette patient en retard: {debt.debtor_name} - {debt.remaining_amount} HTG ({days_overdue} jours)"
            )

            # Notifier le manager
            managers = debt.clinic.users.filter(role='manager', is_active=True)
            for manager in managers:
                if manager.phone:
                    whatsapp_service.send_overdue_debt_alert(
                        phone=manager.phone,
                        debtor_name=debt.debtor_name,
                        amount=f"{debt.remaining_amount:,.0f}",
                        days_overdue=days_overdue
                    )

                notification_service.send_debt_reminder(
                    user=manager,
                    debtor_name=debt.debtor_name,
                    amount=f"{debt.remaining_amount:,.0f}"
                )

            alert_count += 1

    # Dettes entreprise en retard
    overdue_company_debts = CompanyDebt.objects.filter(
        is_paid=False,
        due_date__lt=today
    ).select_related('clinic')

    for company_debt in overdue_company_debts:
        days_overdue = (today - company_debt.due_date).days

        existing_alert = Alert.objects.filter(
            clinic=company_debt.clinic,
            alert_type='overdue_company_debt',
            alert_date__gte=today - timedelta(days=7),
            message__contains=company_debt.creditor_name
        ).exists()

        if not existing_alert:
            Alert.objects.create(
                clinic=company_debt.clinic,
                alert_type='overdue_company_debt',
                alert_level='error',
                alert_date=today,
                message=f"Dette entreprise en retard: {company_debt.creditor_name} - {company_debt.remaining_amount} HTG ({days_overdue} jours)"
            )

            # Notifier les superusers
            superusers = company_debt.clinic.users.filter(
                role__in=['superuser', 'grand_superuser'],
                is_active=True
            )
            for superuser in superusers:
                if superuser.phone:
                    whatsapp_service.send_overdue_debt_alert(
                        phone=superuser.phone,
                        debtor_name=f"{company_debt.creditor_name} (Entreprise)",
                        amount=f"{company_debt.remaining_amount:,.0f}",
                        days_overdue=days_overdue
                    )

            alert_count += 1

    logger.info(f"Created {alert_count} overdue debt alerts")
    return f"Checked overdue debts, created {alert_count} alerts"


@shared_task
def generate_monthly_summary():
    """
    Générer un résumé mensuel (exécuté le 1er de chaque mois à 6h00)
    """
    today = timezone.now().date()
    last_month_start = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    last_month_end = today.replace(day=1) - timedelta(days=1)

    clinics = Clinic.objects.filter(is_active=True)

    for clinic in clinics:
        # Calculer revenus du mois
        reports = DailyReport.objects.filter(
            clinic=clinic,
            report_date__gte=last_month_start,
            report_date__lte=last_month_end
        )

        total_revenue = Decimal('0.00')
        for report in reports:
            total_revenue += report.total_revenue

        # Calculer dépenses du mois
        from .models import Expense
        expenses = Expense.objects.filter(
            clinic=clinic,
            expense_date__gte=last_month_start,
            expense_date__lte=last_month_end
        )
        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Résultat net
        net_result = total_revenue - total_expenses

        summary_data = {
            'period': f"{last_month_start.strftime('%B %Y')}",
            'total_revenue': float(total_revenue),
            'total_expenses': float(total_expenses),
            'net_result': float(net_result)
        }

        # Envoyer aux superusers
        superusers = clinic.users.filter(
            role__in=['superuser', 'grand_superuser'],
            is_active=True
        )

        for superuser in superusers:
            if superuser.phone:
                whatsapp_service.send_monthly_summary(
                    phone=superuser.phone,
                    clinic_name=clinic.name,
                    summary_data=summary_data
                )

        logger.info(f"Monthly summary generated for {clinic.name}")

    return f"Generated monthly summaries for {clinics.count()} clinics"


@shared_task
def clear_old_cache():
    """
    Nettoyer les anciennes entrées de cache (exécuté le 1er du mois à 2h00)
    """
    try:
        from django_redis import get_redis_connection
        conn = get_redis_connection("default")

        # Obtenir toutes les clés avec le préfixe vidmed
        keys = conn.keys("vidmed:*")
        deleted_count = 0

        # Supprimer les clés anciennes (TTL expiré mais toujours présentes)
        for key in keys:
            ttl = conn.ttl(key)
            if ttl == -1:  # Pas de TTL défini
                conn.delete(key)
                deleted_count += 1

        logger.info(f"Cleared {deleted_count} old cache entries")
        return f"Cleared {deleted_count} cache entries"

    except Exception as e:
        logger.error(f"Failed to clear old cache: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def check_low_cash():
    """
    Vérifier la trésorerie faible
    Note: Cette tâche n'est pas dans le schedule par défaut
    """
    LOW_CASH_THRESHOLD = Decimal('50000.00')  # 50,000 HTG

    today = timezone.now().date()
    clinics = Clinic.objects.filter(is_active=True)

    for clinic in clinics:
        # Calculer le solde actuel (simplifié)
        # Dans une vraie implémentation, on utiliserait la vue cash_flow
        cache_key = f'cash_balance:{clinic.id}'
        balance = cache.get(cache_key)

        if balance is not None and balance < LOW_CASH_THRESHOLD:
            # Vérifier si alerte déjà envoyée cette semaine
            existing_alert = Alert.objects.filter(
                clinic=clinic,
                alert_type='low_cash',
                alert_date__gte=today - timedelta(days=7)
            ).exists()

            if not existing_alert:
                Alert.objects.create(
                    clinic=clinic,
                    alert_type='low_cash',
                    alert_level='error',
                    alert_date=today,
                    message=f"Trésorerie faible: {balance:,.0f} HTG (seuil: {LOW_CASH_THRESHOLD:,.0f} HTG)"
                )

                # Notifier les superusers
                superusers = clinic.users.filter(
                    role__in=['superuser', 'grand_superuser'],
                    is_active=True
                )
                for superuser in superusers:
                    if superuser.phone:
                        whatsapp_service.send_low_cash_alert(
                            phone=superuser.phone,
                            clinic_name=clinic.name,
                            cash_balance=f"{balance:,.0f}"
                        )

                    notification_service.send_low_cash_alert(
                        user=superuser,
                        clinic_name=clinic.name,
                        balance=f"{balance:,.0f}"
                    )

    return "Low cash check completed"
