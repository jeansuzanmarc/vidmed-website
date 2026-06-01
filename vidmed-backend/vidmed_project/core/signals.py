from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.cache import cache
from .models import (
    DailyReport, Expense, DebtPayment, CompanyDebtPayment,
    OwnerTransaction, Debt, CompanyDebt
)


@receiver(post_save, sender=DailyReport)
def clear_cache_on_daily_report(sender, instance, created, **kwargs):
    """Invalider le cache quand un rapport journalier est créé/modifié"""
    cache_keys = [
        f'dashboard:{instance.clinic.id}',
        f'cash_flow:{instance.clinic.id}',
        f'monthly_summary:{instance.clinic.id}',
    ]
    cache.delete_many(cache_keys)


@receiver(post_save, sender=Expense)
def clear_cache_on_expense(sender, instance, created, **kwargs):
    """Invalider le cache quand une dépense est créée/modifiée"""
    cache_keys = [
        f'dashboard:{instance.clinic.id}',
        f'cash_flow:{instance.clinic.id}',
        f'monthly_summary:{instance.clinic.id}',
    ]
    cache.delete_many(cache_keys)


@receiver(post_save, sender=DebtPayment)
def update_debt_on_payment(sender, instance, created, **kwargs):
    """Mettre à jour la dette patient lors d'un paiement"""
    if created:
        debt = instance.debt
        debt.remaining_amount -= instance.amount

        if debt.remaining_amount <= 0:
            debt.remaining_amount = 0
            debt.is_paid = True
            debt.paid_date = instance.payment_date

        debt.save()

        # Invalider cache
        cache_keys = [
            f'dashboard:{debt.clinic.id}',
            f'cash_flow:{debt.clinic.id}',
            f'debts:{debt.clinic.id}',
        ]
        cache.delete_many(cache_keys)


@receiver(post_save, sender=CompanyDebtPayment)
def update_company_debt_on_payment(sender, instance, created, **kwargs):
    """Mettre à jour la dette entreprise lors d'un paiement"""
    if created:
        company_debt = instance.company_debt
        company_debt.remaining_amount -= instance.amount

        if company_debt.remaining_amount <= 0:
            company_debt.remaining_amount = 0
            company_debt.is_paid = True
            company_debt.paid_date = instance.payment_date

        company_debt.save()

        # Invalider cache
        cache_keys = [
            f'dashboard:{company_debt.clinic.id}',
            f'cash_flow:{company_debt.clinic.id}',
            f'company_debts:{company_debt.clinic.id}',
        ]
        cache.delete_many(cache_keys)


@receiver(post_save, sender=OwnerTransaction)
def clear_cache_on_owner_transaction(sender, instance, created, **kwargs):
    """Invalider le cache quand une transaction propriétaire est créée"""
    cache_keys = [
        f'dashboard:{instance.clinic.id}',
        f'cash_flow:{instance.clinic.id}',
        f'owner_transactions:{instance.clinic.id}',
    ]
    cache.delete_many(cache_keys)


@receiver(pre_save, sender=Debt)
def calculate_remaining_amount_debt(sender, instance, **kwargs):
    """Calculer le montant restant lors de la création d'une dette patient"""
    if not instance.pk:  # Nouvelle dette
        instance.remaining_amount = instance.original_amount - instance.initial_payment


@receiver(pre_save, sender=CompanyDebt)
def calculate_remaining_amount_company_debt(sender, instance, **kwargs):
    """Calculer le montant restant lors de la création d'une dette entreprise"""
    if not instance.pk:  # Nouvelle dette
        instance.remaining_amount = instance.original_amount
