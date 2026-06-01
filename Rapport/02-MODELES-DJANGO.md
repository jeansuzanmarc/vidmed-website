# 🗄️ Modèles Django - Base de Données VIDMED

Ce fichier contient **TOUS les modèles** de la base de données.

**12 tables principales** pour gérer le système de cash-flow.

---

## 📦 Fichier: `core/models.py`

Copier-coller ce code COMPLET dans `vidmed-backend/core/models.py`:

```python
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone

# ==================== USER MODEL ====================
class User(AbstractUser):
    """
    Utilisateurs avec 3 rôles
    """
    ROLE_CHOICES = [
        ('grand_superuser', 'Grand Superuser'),
        ('superuser', 'Superuser'),
        ('manager', 'Manager'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


# ==================== CLINIC MODEL ====================
class Clinic(models.Model):
    """
    Cliniques
    """
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_clinics',
        limit_choices_to={'role': 'manager'}
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'clinics'
        ordering = ['name']
    
    def __str__(self):
        return self.name


# ==================== ACCOUNT CODE MODEL ====================
class AccountCode(models.Model):
    """
    Codes de comptes pour classification des transactions
    """
    ACCOUNT_TYPES = [
        ('cash', 'Trésorerie'),
        ('revenue', 'Revenus'),
        ('expense', 'Dépenses'),
        ('equity', 'Capitaux'),
    ]
    
    CATEGORIES = [
        ('cash', 'Trésorerie'),
        ('revenue', 'Revenus'),
        ('purchases', 'Achats'),
        ('salaries', 'Salaires'),
        ('fixed_charges', 'Charges fixes'),
        ('variable_charges', 'Charges variables'),
        ('debts', 'Dettes'),
        ('equity', 'Capitaux'),
        ('other', 'Autres'),
    ]
    
    code = models.CharField(
        max_length=50, 
        unique=True,
        help_text="Ex: REV_CONSULTATION, ACH_MEDICAMENT"
    )
    name = models.CharField(max_length=200, help_text="Nom complet du compte")
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(
        default=False,
        help_text="Compte système (ne peut être supprimé)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'account_codes'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


# ==================== DAILY REPORT MODEL ====================
class DailyReport(models.Model):
    """
    Rapport journalier
    """
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    report_date = models.DateField()
    
    # Revenus (services en HTG)
    consultations = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Revenus consultations"
    )
    medicines = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Revenus pharmacie"
    )
    exams = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Revenus examens"
    )
    other_services = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Autres services (injections, sutures, etc.)"
    )
    total_services = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total calculé automatiquement"
    )
    
    # Métadonnées
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'daily_reports'
        ordering = ['-report_date', '-created_at']
        indexes = [
            models.Index(fields=['clinic', 'report_date']),
            models.Index(fields=['report_date']),
        ]
        unique_together = ['clinic', 'report_date']
    
    def __str__(self):
        return f"{self.clinic.name} - {self.report_date}"
    
    def save(self, *args, **kwargs):
        # Calculer automatiquement le total
        self.total_services = (
            self.consultations + 
            self.medicines + 
            self.exams + 
            self.other_services
        )
        super().save(*args, **kwargs)


# ==================== EXPENSE MODEL ====================
class Expense(models.Model):
    """
    Dépenses avec code de compte OBLIGATOIRE
    """
    daily_report = models.ForeignKey(
        DailyReport,
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    
    # ✅ Code de compte OBLIGATOIRE
    account_code = models.ForeignKey(
        AccountCode,
        on_delete=models.PROTECT,
        related_name='expenses',
        limit_choices_to={'account_type': 'expense'},
        help_text="Type de dépense (obligatoire)"
    )
    
    description = models.CharField(
        max_length=500,
        help_text="Description de la dépense"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    expense_date = models.DateField()
    
    # Détails optionnels
    supplier_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Nom du fournisseur"
    )
    invoice_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Numéro facture"
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_expenses'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expenses'
        ordering = ['-expense_date', '-created_at']
        indexes = [
            models.Index(fields=['account_code', 'expense_date']),
            models.Index(fields=['expense_date']),
        ]
    
    def __str__(self):
        return f"{self.account_code.code} - {self.amount} HTG"


# ==================== DEBT MODEL ====================
class Debt(models.Model):
    """
    Dettes patients (argent que les patients nous doivent)
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paid', 'Payée'),
        ('cancelled', 'Annulée'),
    ]
    
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='debts'
    )
    debtor_name = models.CharField(max_length=200, help_text="Nom du patient")
    debtor_phone = models.CharField(max_length=20, blank=True)
    
    original_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    remaining_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    initial_payment = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Paiement initial le jour même"
    )
    
    debt_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_debts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'debts'
        ordering = ['-debt_date', '-created_at']
        indexes = [
            models.Index(fields=['clinic', 'status']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.debtor_name} - {self.remaining_amount} HTG"
    
    def is_overdue(self):
        """Vérifie si la dette est en retard"""
        if self.due_date and self.status == 'active':
            return timezone.now().date() > self.due_date
        return False
    
    def save(self, *args, **kwargs):
        # Calculer le montant restant lors de la création
        if not self.pk and self.initial_payment > 0:
            self.remaining_amount = self.original_amount - self.initial_payment
            
            # Si payé en totalité
            if self.remaining_amount <= 0:
                self.remaining_amount = Decimal('0.00')
                self.status = 'paid'
        
        super().save(*args, **kwargs)


# ==================== DEBT PAYMENT MODEL ====================
class DebtPayment(models.Model):
    """
    Paiements de dettes patients
    """
    debt = models.ForeignKey(
        Debt,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    payment_date = models.DateField()
    notes = models.TextField(blank=True)
    
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_payments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'debt_payments'
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        return f"Paiement {self.amount} HTG - {self.payment_date}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Mettre à jour le montant restant de la dette
        self.debt.remaining_amount -= self.amount
        
        # Si dette payée complètement
        if self.debt.remaining_amount <= 0:
            self.debt.remaining_amount = Decimal('0.00')
            self.debt.status = 'paid'
        
        self.debt.save()


# ==================== COMPANY DEBT MODEL ====================
class CompanyDebt(models.Model):
    """
    Dettes de l'entreprise (argent que la clinique doit à des tiers)
    """
    DEBT_TYPES = [
        ('supplier', 'Fournisseur'),
        ('employee', 'Employé/Salaire'),
        ('bank', 'Banque/Prêt'),
        ('utilities', 'Services publics'),
        ('rent', 'Loyer'),
        ('insurance', 'Assurance'),
        ('taxes', 'Impôts'),
        ('equipment', 'Équipement/Matériel'),
        ('other', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('partial', 'Partiellement payée'),
        ('paid', 'Payée'),
        ('cancelled', 'Annulée'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Basse'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
        ('urgent', 'Urgente'),
    ]
    
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='company_debts'
    )
    
    creditor_name = models.CharField(max_length=200)
    creditor_phone = models.CharField(max_length=20, blank=True)
    
    debt_type = models.CharField(max_length=20, choices=DEBT_TYPES)
    description = models.TextField(help_text="Description détaillée")
    
    original_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    remaining_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    debt_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_company_debts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'company_debts'
        ordering = ['-debt_date', '-priority']
        indexes = [
            models.Index(fields=['clinic', 'status']),
            models.Index(fields=['debt_type', 'status']),
            models.Index(fields=['priority', 'status']),
        ]
    
    def __str__(self):
        return f"{self.creditor_name} - {self.remaining_amount} HTG"
    
    def save(self, *args, **kwargs):
        # Calculer le montant restant
        self.remaining_amount = self.original_amount - self.paid_amount
        
        # Mettre à jour le statut automatiquement
        if self.remaining_amount <= 0:
            self.status = 'paid'
        elif self.paid_amount > 0 and self.remaining_amount > 0:
            self.status = 'partial'
        
        super().save(*args, **kwargs)
    
    def is_overdue(self):
        if self.due_date and self.status in ['pending', 'partial']:
            return timezone.now().date() > self.due_date
        return False
    
    @property
    def payment_percentage(self):
        if self.original_amount > 0:
            return round((self.paid_amount / self.original_amount) * 100, 2)
        return 0


# ==================== COMPANY DEBT PAYMENT MODEL ====================
class CompanyDebtPayment(models.Model):
    """
    Paiements des dettes entreprise
    """
    PAYMENT_METHODS = [
        ('cash', 'Espèces'),
        ('check', 'Chèque'),
        ('bank_transfer', 'Virement bancaire'),
        ('mobile_money', 'Mobile money'),
        ('other', 'Autre'),
    ]
    
    company_debt = models.ForeignKey(
        CompanyDebt,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_company_debt_payments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'company_debt_payments'
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        return f"Paiement {self.amount} HTG - {self.payment_date}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Mettre à jour le montant payé de la dette
        self.company_debt.paid_amount += self.amount
        self.company_debt.save()


# ==================== OWNER TRANSACTION MODEL ====================
class OwnerTransaction(models.Model):
    """
    Apports et prélèvements du propriétaire
    """
    TRANSACTION_TYPES = [
        ('contribution', 'Apport'),
        ('withdrawal', 'Prélèvement'),
    ]
    
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='owner_transactions'
    )
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    transaction_date = models.DateField()
    description = models.TextField(help_text="Raison de l'apport ou du prélèvement")
    
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_owner_transactions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'owner_transactions'
        ordering = ['-transaction_date', '-created_at']
    
    def __str__(self):
        type_label = 'Apport' if self.transaction_type == 'contribution' else 'Prélèvement'
        return f"{type_label} - {self.amount} HTG - {self.transaction_date}"


# ==================== CASH FLOW TRANSACTION MODEL ====================
class CashFlowTransaction(models.Model):
    """
    Vue consolidée de toutes les transactions (GÉNÉRÉ AUTOMATIQUEMENT)
    """
    FLOW_TYPES = [
        ('in', 'Entrée'),
        ('out', 'Sortie'),
    ]
    
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='cash_flow_transactions'
    )
    transaction_date = models.DateField()
    
    account_code = models.ForeignKey(AccountCode, on_delete=models.PROTECT)
    flow_type = models.CharField(max_length=10, choices=FLOW_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField()
    
    # Référence à la transaction source
    source_type = models.CharField(max_length=50)
    source_id = models.IntegerField()
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cash_flow_transactions'
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['clinic', 'transaction_date']),
            models.Index(fields=['account_code', 'transaction_date']),
            models.Index(fields=['flow_type', 'transaction_date']),
        ]
    
    def __str__(self):
        flow = '📈' if self.flow_type == 'in' else '📉'
        return f"{flow} {self.account_code.code} - {self.amount} HTG"


# ==================== ALERT MODEL ====================
class Alert(models.Model):
    """
    Alertes pour rapports manquants
    """
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    alert_date = models.DateField(help_text="Date du rapport manquant")
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'alerts'
        ordering = ['-alert_date', '-created_at']
    
    def __str__(self):
        status = '✅' if self.is_resolved else '⚠️'
        return f"{status} {self.clinic.name} - {self.alert_date}"


# ==================== CLINIC OFF DAY MODEL ====================
class ClinicOffDay(models.Model):
    """
    Jours où la clinique est fermée (congés)
    """
    OFF_TYPES = [
        ('manager_off', 'Manager absent'),
        ('clinic_closed', 'Clinique fermée'),
        ('holiday', 'Jour férié'),
    ]
    
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='off_days'
    )
    off_date = models.DateField()
    off_type = models.CharField(max_length=20, choices=OFF_TYPES)
    reason = models.TextField(blank=True)
    
    marked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='marked_off_days'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'clinic_off_days'
        ordering = ['-off_date']
        unique_together = ['clinic', 'off_date']
    
    def __str__(self):
        return f"{self.clinic.name} - {self.off_date} ({self.get_off_type_display()})"
```

---

## ✅ Résumé des Modèles

| # | Modèle | Table | Description |
|---|--------|-------|-------------|
| 1 | User | users | Utilisateurs (3 rôles) |
| 2 | Clinic | clinics | Cliniques |
| 3 | AccountCode | account_codes | **Codes de comptes** |
| 4 | DailyReport | daily_reports | Rapports journaliers |
| 5 | Expense | expenses | **Dépenses avec code** |
| 6 | Debt | debts | Dettes patients |
| 7 | DebtPayment | debt_payments | Paiements dettes |
| 8 | CompanyDebt | company_debts | Dettes entreprise |
| 9 | CompanyDebtPayment | company_debt_payments | Paiements dettes entreprise |
| 10 | OwnerTransaction | owner_transactions | **Apports/Prélèvements** |
| 11 | CashFlowTransaction | cash_flow_transactions | **Transactions consolidées (AUTO)** |
| 12 | Alert | alerts | Alertes rapports manquants |
| 13 | ClinicOffDay | clinic_off_days | Jours de congé |

---

## 🔑 Points Clés

### ✅ Nouveautés Importantes

1. **AccountCode** → Codes de comptes (REV_CONSULTATION, ACH_MEDICAMENT, etc.)
2. **Expense.account_code** → Champ OBLIGATOIRE pour type de dépense
3. **OwnerTransaction** → Apports et prélèvements propriétaire
4. **CashFlowTransaction** → Table générée AUTOMATIQUEMENT par signaux

### 🔄 Automatismes

- ✅ `DailyReport.total_services` calculé automatiquement
- ✅ `Expense` génère une `CashFlowTransaction` automatiquement
- ✅ `DebtPayment` met à jour `Debt.remaining_amount` automatiquement
- ✅ `CompanyDebtPayment` met à jour `CompanyDebt.paid_amount` automatiquement
- ✅ `Debt.status` mis à jour automatiquement (paid si remaining = 0)
- ✅ `CompanyDebt.status` mis à jour automatiquement

---

## 📝 Prochaine Étape

**Après avoir copié ce fichier dans `core/models.py`:**

1. ✅ Créer les signaux Django (génération auto transactions)
2. ✅ Configurer settings.py
3. ✅ Créer les migrations
4. ✅ Initialiser les codes de comptes

**➡️ Continuez avec `03-SIGNAUX-DJANGO.md`**

---

**Version:** 2.0  
**Date:** 1er juin 2026  
**Fichiers:** 1 fichier créé (`core/models.py`)
