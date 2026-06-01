from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from simple_history.models import HistoricalRecords
from .mixins import SoftDeleteMixin, TimestampMixin, SoftDeleteManager, AllObjectsManager


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé avec 3 rôles hiérarchiques
    """
    ROLE_CHOICES = [
        ('grand_superuser', 'Grand Superuser'),
        ('superuser', 'Superuser'),
        ('manager', 'Manager'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='manager')
    phone = models.CharField(max_length=20, blank=True, help_text="Format: +50937123456 pour WhatsApp")
    clinic = models.ForeignKey('Clinic', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    is_active = models.BooleanField(default=True)

    # Pour notifications push
    fcm_token = models.CharField(max_length=255, blank=True, help_text="Firebase Cloud Messaging token")

    history = HistoricalRecords()

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_grand_superuser(self):
        return self.role == 'grand_superuser'

    @property
    def is_superuser_role(self):
        return self.role in ['superuser', 'grand_superuser']

    @property
    def is_manager_role(self):
        return self.role == 'manager'


class Clinic(SoftDeleteMixin, TimestampMixin):
    """
    Modèle Clinique - peut gérer plusieurs cliniques
    """
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)

    # Managers
    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    history = HistoricalRecords()

    class Meta:
        db_table = 'clinics'
        ordering = ['name']

    def __str__(self):
        return self.name


class AccountCode(SoftDeleteMixin, TimestampMixin):
    """
    Codes de compte explicites pour la comptabilité
    """
    ACCOUNT_TYPES = [
        ('revenue', 'Revenu (Entrée)'),
        ('expense', 'Dépense (Sortie)'),
    ]

    CATEGORIES = [
        ('medical_services', 'Services Médicaux'),
        ('pharmacy', 'Pharmacie'),
        ('laboratory', 'Laboratoire'),
        ('radiology', 'Radiologie'),
        ('surgery', 'Chirurgie'),
        ('salaries', 'Salaires'),
        ('medications', 'Médicaments'),
        ('supplies', 'Fournitures'),
        ('utilities', 'Services Publics'),
        ('maintenance', 'Entretien'),
        ('rent', 'Loyer'),
        ('insurance', 'Assurance'),
        ('equipment', 'Équipement'),
        ('other', 'Autre'),
    ]

    code = models.CharField(max_length=50, unique=True, help_text="Ex: REV_CONSULTATION, SAL_MEDECIN")
    name = models.CharField(max_length=200)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    # Mapping comptabilité légale SYSCOHADA (optionnel)
    legal_code = models.CharField(max_length=10, blank=True, help_text="Code SYSCOHADA (ex: 706100)")
    legal_name = models.CharField(max_length=200, blank=True)
    account_class = models.CharField(max_length=1, blank=True, help_text="Classe 1-7 SYSCOHADA")

    # Managers
    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    history = HistoricalRecords()

    class Meta:
        db_table = 'account_codes'
        ordering = ['code']
        indexes = [
            models.Index(fields=['account_type', 'is_active']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class DailyReport(SoftDeleteMixin, TimestampMixin):
    """
    Rapport journalier du Manager - revenus par catégorie
    """
    # Validation limits (HTG)
    MAX_CONSULTATION_DAILY = Decimal('500000.00')
    MAX_MEDICINES_DAILY = Decimal('2000000.00')
    MAX_LABORATORY_DAILY = Decimal('500000.00')
    MAX_RADIOLOGY_DAILY = Decimal('300000.00')
    MAX_SURGERY_DAILY = Decimal('5000000.00')
    MAX_OTHER_REVENUE_DAILY = Decimal('1000000.00')
    MAX_PATIENTS_DAILY = 500  # Maximum de patients par jour

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='daily_reports')
    report_date = models.DateField(db_index=True)
    submitted_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='submitted_reports')

    # Nombre de patients reçus dans la journée
    patient_count = models.PositiveIntegerField(default=0, help_text="Nombre de patients reçus aujourd'hui")

    # Revenus par catégorie (HTG)
    consultations = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    medicines = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    laboratory = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    radiology = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    surgery = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    other_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    notes = models.TextField(blank=True)

    # Managers
    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    history = HistoricalRecords()

    class Meta:
        db_table = 'daily_reports'
        unique_together = [['clinic', 'report_date']]
        ordering = ['-report_date']
        indexes = [
            models.Index(fields=['clinic', 'report_date']),
            models.Index(fields=['submitted_by', 'report_date']),
        ]

    def __str__(self):
        return f"Rapport {self.clinic.name} - {self.report_date}"

    def clean(self):
        """Validation des montants aberrants"""
        errors = {}

        if self.patient_count > self.MAX_PATIENTS_DAILY:
            errors['patient_count'] = f'Nombre aberrant. Maximum: {self.MAX_PATIENTS_DAILY} patients/jour'

        if self.consultations > self.MAX_CONSULTATION_DAILY:
            errors['consultations'] = f'Montant aberrant. Maximum: {self.MAX_CONSULTATION_DAILY} HTG/jour'

        if self.medicines > self.MAX_MEDICINES_DAILY:
            errors['medicines'] = f'Montant aberrant. Maximum: {self.MAX_MEDICINES_DAILY} HTG/jour'

        if self.laboratory > self.MAX_LABORATORY_DAILY:
            errors['laboratory'] = f'Montant aberrant. Maximum: {self.MAX_LABORATORY_DAILY} HTG/jour'

        if self.radiology > self.MAX_RADIOLOGY_DAILY:
            errors['radiology'] = f'Montant aberrant. Maximum: {self.MAX_RADIOLOGY_DAILY} HTG/jour'

        if self.surgery > self.MAX_SURGERY_DAILY:
            errors['surgery'] = f'Montant aberrant. Maximum: {self.MAX_SURGERY_DAILY} HTG/jour'

        if self.other_revenue > self.MAX_OTHER_REVENUE_DAILY:
            errors['other_revenue'] = f'Montant aberrant. Maximum: {self.MAX_OTHER_REVENUE_DAILY} HTG/jour'

        if errors:
            raise ValidationError(errors)

    @property
    def total_revenue(self):
        return (
            self.consultations + self.medicines + self.laboratory +
            self.radiology + self.surgery + self.other_revenue
        )


class Expense(SoftDeleteMixin, TimestampMixin):
    """
    Dépenses - OBLIGATOIRE de choisir un AccountCode
    """
    MAX_EXPENSE_AMOUNT = Decimal('10000000.00')  # 10M HTG max par dépense

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='expenses')
    account_code = models.ForeignKey(
        AccountCode,
        on_delete=models.PROTECT,
        related_name='expenses',
        limit_choices_to={'account_type': 'expense', 'is_active': True}
    )
    expense_date = models.DateField(db_index=True)
    description = models.CharField(max_length=500)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recorded_expenses')

    # Managers
    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    history = HistoricalRecords()

    class Meta:
        db_table = 'expenses'
        ordering = ['-expense_date']
        indexes = [
            models.Index(fields=['clinic', 'expense_date']),
            models.Index(fields=['account_code', 'expense_date']),
        ]

    def __str__(self):
        return f"{self.account_code.code} - {self.amount} HTG ({self.expense_date})"

    def clean(self):
        """Validation du montant"""
        if self.amount > self.MAX_EXPENSE_AMOUNT:
            raise ValidationError({
                'amount': f'Montant aberrant. Maximum: {self.MAX_EXPENSE_AMOUNT} HTG'
            })
        if self.amount <= 0:
            raise ValidationError({'amount': 'Le montant doit être positif'})


class Debt(SoftDeleteMixin, TimestampMixin):
    """
    DETTES PATIENTS (Créances) - Argent que les patients DOIVENT À la clinique
    Géré par: Manager
    """
    MAX_DEBT_AMOUNT = Decimal('5000000.00')  # 5M HTG max

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='patient_debts')
    debtor_name = models.CharField(max_length=200, help_text="Nom du patient")
    debtor_phone = models.CharField(max_length=20, blank=True)

    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    initial_payment = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)

    debt_date = models.DateField(db_index=True)
    due_date = models.DateField(null=True, blank=True)

    description = models.TextField(help_text="Raison de la dette (consultation, médicaments, etc.)")

    is_paid = models.BooleanField(default=False, db_index=True)
    paid_date = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_debts')

    # Managers
    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    history = HistoricalRecords()

    class Meta:
        db_table = 'patient_debts'
        ordering = ['-debt_date']
        indexes = [
            models.Index(fields=['clinic', 'is_paid']),
            models.Index(fields=['debt_date']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"Dette: {self.debtor_name} - {self.remaining_amount} HTG"

    def clean(self):
        """Validation"""
        errors = {}

        if self.original_amount > self.MAX_DEBT_AMOUNT:
            errors['original_amount'] = f'Montant aberrant. Maximum: {self.MAX_DEBT_AMOUNT} HTG'

        if self.original_amount <= 0:
            errors['original_amount'] = 'Le montant doit être positif'

        if self.initial_payment > self.original_amount:
            errors['initial_payment'] = 'Le paiement initial ne peut pas dépasser le montant total'

        if self.remaining_amount > self.original_amount:
            errors['remaining_amount'] = 'Le montant restant ne peut pas dépasser le montant original'

        if errors:
            raise ValidationError(errors)

    @property
    def is_overdue(self):
        """Dette en retard?"""
        if self.is_paid or not self.due_date:
            return False
        return timezone.now().date() > self.due_date


class DebtPayment(TimestampMixin):
    """
    Paiements sur dettes patients
    """
    debt = models.ForeignKey(Debt, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField(db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='cash')
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recorded_debt_payments')

    history = HistoricalRecords()

    class Meta:
        db_table = 'debt_payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"Paiement {self.amount} HTG - {self.debt.debtor_name} ({self.payment_date})"

    def clean(self):
        if self.amount <= 0:
            raise ValidationError({'amount': 'Le montant doit être positif'})
        if self.amount > self.debt.remaining_amount:
            raise ValidationError({
                'amount': f'Le paiement ({self.amount} HTG) dépasse le montant restant ({self.debt.remaining_amount} HTG)'
            })


class CompanyDebt(SoftDeleteMixin, TimestampMixin):
    """
    DETTES ENTREPRISE (Passif) - Argent que la clinique DOIT À d'autres
    Géré par: Superuser uniquement
    """
    DEBT_TYPES = [
        ('supplier', 'Fournisseur'),
        ('employee', 'Employé/Salaire'),
        ('bank', 'Banque/Prêt'),
        ('utilities', 'Services Publics'),
        ('rent', 'Loyer'),
        ('insurance', 'Assurance'),
        ('taxes', 'Impôts/Taxes'),
        ('equipment', 'Équipement'),
        ('other', 'Autre'),
    ]

    MAX_COMPANY_DEBT = Decimal('50000000.00')  # 50M HTG max

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='company_debts')
    creditor_name = models.CharField(max_length=200, help_text="Nom du créancier (fournisseur, banque, etc.)")
    creditor_phone = models.CharField(max_length=20, blank=True)
    debt_type = models.CharField(max_length=20, choices=DEBT_TYPES)

    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)

    debt_date = models.DateField(db_index=True)
    due_date = models.DateField(null=True, blank=True)

    description = models.TextField(help_text="Description détaillée obligatoire")

    is_paid = models.BooleanField(default=False, db_index=True)
    paid_date = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_company_debts')

    # Managers
    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    history = HistoricalRecords()

    class Meta:
        db_table = 'company_debts'
        ordering = ['-debt_date']
        indexes = [
            models.Index(fields=['clinic', 'debt_type', 'is_paid']),
            models.Index(fields=['debt_date']),
        ]

    def __str__(self):
        return f"Dette entreprise: {self.creditor_name} - {self.remaining_amount} HTG"

    def clean(self):
        """Validation"""
        errors = {}

        if self.original_amount > self.MAX_COMPANY_DEBT:
            errors['original_amount'] = f'Montant aberrant. Maximum: {self.MAX_COMPANY_DEBT} HTG'

        if self.original_amount <= 0:
            errors['original_amount'] = 'Le montant doit être positif'

        if not self.description or len(self.description) < 10:
            errors['description'] = 'Description détaillée obligatoire (minimum 10 caractères)'

        if errors:
            raise ValidationError(errors)

    @property
    def is_overdue(self):
        if self.is_paid or not self.due_date:
            return False
        return timezone.now().date() > self.due_date


class CompanyDebtPayment(TimestampMixin):
    """
    Paiements sur dettes entreprise
    """
    company_debt = models.ForeignKey(CompanyDebt, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateField(db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='cash')
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recorded_company_debt_payments')

    history = HistoricalRecords()

    class Meta:
        db_table = 'company_debt_payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"Paiement {self.amount} HTG - {self.company_debt.creditor_name} ({self.payment_date})"

    def clean(self):
        if self.amount <= 0:
            raise ValidationError({'amount': 'Le montant doit être positif'})
        if self.amount > self.company_debt.remaining_amount:
            raise ValidationError({
                'amount': f'Le paiement dépasse le montant restant'
            })


class OwnerTransaction(TimestampMixin):
    """
    Transactions propriétaire (apports et retraits)
    Géré par: Superuser uniquement
    """
    TRANSACTION_TYPES = [
        ('contribution', 'Apport (Capital)'),
        ('withdrawal', 'Retrait'),
    ]

    MAX_TRANSACTION = Decimal('100000000.00')  # 100M HTG max

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='owner_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    transaction_date = models.DateField(db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recorded_owner_transactions')

    history = HistoricalRecords()

    class Meta:
        db_table = 'owner_transactions'
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['clinic', 'transaction_type', 'transaction_date']),
        ]

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} HTG ({self.transaction_date})"

    def clean(self):
        if self.amount > self.MAX_TRANSACTION:
            raise ValidationError({
                'amount': f'Montant aberrant. Maximum: {self.MAX_TRANSACTION} HTG'
            })
        if self.amount <= 0:
            raise ValidationError({'amount': 'Le montant doit être positif'})


class Alert(TimestampMixin):
    """
    Alertes système (rapports manquants, dettes impayées, etc.)
    """
    ALERT_TYPES = [
        ('missing_report', 'Rapport manquant'),
        ('overdue_debt', 'Dette patient en retard'),
        ('overdue_company_debt', 'Dette entreprise en retard'),
        ('low_cash', 'Trésorerie faible'),
        ('other', 'Autre'),
    ]

    ALERT_LEVELS = [
        ('info', 'Information'),
        ('warning', 'Avertissement'),
        ('error', 'Erreur'),
    ]

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPES)
    alert_level = models.CharField(max_length=10, choices=ALERT_LEVELS, default='warning')
    alert_date = models.DateField(db_index=True)
    message = models.TextField()

    is_resolved = models.BooleanField(default=False, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts')

    # WhatsApp envoyé?
    whatsapp_sent = models.BooleanField(default=False)
    whatsapp_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'alerts'
        ordering = ['-alert_date', '-created_at']
        indexes = [
            models.Index(fields=['clinic', 'is_resolved']),
            models.Index(fields=['alert_type', 'alert_date']),
        ]

    def __str__(self):
        return f"Alerte {self.get_alert_type_display()} - {self.clinic.name} ({self.alert_date})"


class SavedFilter(TimestampMixin):
    """
    Filtres sauvegardés par les utilisateurs
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_filters')
    name = models.CharField(max_length=100)
    filter_type = models.CharField(max_length=50, help_text="Type de vue (cash_flow, expenses, debts, etc.)")
    filter_params = models.JSONField(help_text="Paramètres du filtre en JSON")
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = 'saved_filters'
        ordering = ['name']
        unique_together = [['user', 'name', 'filter_type']]

    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.filter_type})"
