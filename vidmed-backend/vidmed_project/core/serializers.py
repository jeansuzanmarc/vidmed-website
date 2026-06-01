from rest_framework import serializers
from .models import (
    User, Clinic, AccountCode, DailyReport, Expense,
    Debt, DebtPayment, CompanyDebt, CompanyDebtPayment,
    OwnerTransaction, Alert, SavedFilter
)
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'clinic', 'is_active', 'fcm_token',
            'password', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ClinicSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Clinic
        fields = ['id', 'name', 'address', 'phone', 'email', 'is_active', 'user_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_count(self, obj):
        return obj.users.filter(is_active=True).count()


class AccountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountCode
        fields = [
            'id', 'code', 'name', 'account_type', 'category',
            'description', 'is_active', 'legal_code', 'legal_name',
            'account_class', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DailyReportSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    revenue_per_patient = serializers.SerializerMethodField()

    class Meta:
        model = DailyReport
        fields = [
            'id', 'clinic', 'clinic_name', 'report_date', 'submitted_by',
            'submitted_by_name', 'patient_count', 'consultations', 'medicines', 'laboratory',
            'radiology', 'surgery', 'other_revenue', 'total_revenue',
            'revenue_per_patient', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_revenue_per_patient(self, obj):
        """Calculer le revenu moyen par patient"""
        if obj.patient_count > 0:
            return round(obj.total_revenue / obj.patient_count, 2)
        return 0

    def validate(self, data):
        """Validation personnalisée"""
        instance = DailyReport(**data)
        instance.clean()  # Appelle clean() du modèle
        return data


class ExpenseSerializer(serializers.ModelSerializer):
    account_code_name = serializers.CharField(source='account_code.name', read_only=True)
    account_code_code = serializers.CharField(source='account_code.code', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'clinic', 'clinic_name', 'account_code', 'account_code_code',
            'account_code_name', 'expense_date', 'description', 'amount',
            'recorded_by', 'recorded_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        instance = Expense(**data)
        instance.clean()
        return data


class DebtSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_since_creation = serializers.SerializerMethodField()

    class Meta:
        model = Debt
        fields = [
            'id', 'clinic', 'clinic_name', 'debtor_name', 'debtor_phone',
            'original_amount', 'initial_payment', 'remaining_amount',
            'debt_date', 'due_date', 'description', 'is_paid', 'paid_date',
            'created_by', 'created_by_name', 'is_overdue', 'days_since_creation',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'remaining_amount', 'is_paid', 'paid_date', 'created_at', 'updated_at']

    def validate(self, data):
        instance = Debt(**data)
        instance.clean()
        return data

    def get_days_since_creation(self, obj):
        from django.utils import timezone
        delta = timezone.now().date() - obj.debt_date
        return delta.days


class DebtPaymentSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    debtor_name = serializers.CharField(source='debt.debtor_name', read_only=True)

    class Meta:
        model = DebtPayment
        fields = [
            'id', 'debt', 'debtor_name', 'payment_date', 'amount',
            'payment_method', 'notes', 'recorded_by', 'recorded_by_name',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        instance = DebtPayment(**data)
        instance.clean()
        return data


class CompanyDebtSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    debt_type_display = serializers.CharField(source='get_debt_type_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = CompanyDebt
        fields = [
            'id', 'clinic', 'clinic_name', 'creditor_name', 'creditor_phone',
            'debt_type', 'debt_type_display', 'original_amount', 'remaining_amount',
            'debt_date', 'due_date', 'description', 'is_paid', 'paid_date',
            'created_by', 'created_by_name', 'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'remaining_amount', 'is_paid', 'paid_date', 'created_at', 'updated_at']

    def validate(self, data):
        instance = CompanyDebt(**data)
        instance.clean()
        return data


class CompanyDebtPaymentSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    creditor_name = serializers.CharField(source='company_debt.creditor_name', read_only=True)

    class Meta:
        model = CompanyDebtPayment
        fields = [
            'id', 'company_debt', 'creditor_name', 'payment_date', 'amount',
            'payment_method', 'notes', 'recorded_by', 'recorded_by_name',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        instance = CompanyDebtPayment(**data)
        instance.clean()
        return data


class OwnerTransactionSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = OwnerTransaction
        fields = [
            'id', 'clinic', 'clinic_name', 'transaction_type', 'transaction_type_display',
            'transaction_date', 'amount', 'description', 'recorded_by',
            'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        instance = OwnerTransaction(**data)
        instance.clean()
        return data


class AlertSerializer(serializers.ModelSerializer):
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    alert_level_display = serializers.CharField(source='get_alert_level_display', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)

    class Meta:
        model = Alert
        fields = [
            'id', 'clinic', 'clinic_name', 'alert_type', 'alert_type_display',
            'alert_level', 'alert_level_display', 'alert_date', 'message',
            'is_resolved', 'resolved_at', 'resolved_by', 'resolved_by_name',
            'whatsapp_sent', 'whatsapp_sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SavedFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedFilter
        fields = ['id', 'user', 'name', 'filter_type', 'filter_params', 'is_default', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class CashFlowSerializer(serializers.Serializer):
    """
    Serializer pour la vue cash_flow_view (pas un vrai modèle)
    """
    source = serializers.CharField()
    source_detail = serializers.CharField()
    source_id = serializers.IntegerField()
    clinic_id = serializers.IntegerField()
    transaction_date = serializers.DateField()
    account_code_id = serializers.IntegerField(allow_null=True)
    account_code_name = serializers.CharField(allow_null=True)
    account_code_code = serializers.CharField(allow_null=True)
    flow_type = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    user_id = serializers.IntegerField(allow_null=True)
    user_name = serializers.CharField(allow_null=True)
    description = serializers.CharField(allow_null=True)
    created_at = serializers.DateTimeField()


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques du dashboard"""
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_result = serializers.DecimalField(max_digits=12, decimal_places=2)
    cash_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_patient_debts = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_company_debts = serializers.DecimalField(max_digits=12, decimal_places=2)
    missing_reports_count = serializers.IntegerField()
    overdue_debts_count = serializers.IntegerField()


class PeriodComparisonSerializer(serializers.Serializer):
    """Serializer pour la comparaison de périodes"""
    period1_label = serializers.CharField()
    period1_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    period1_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    period1_net = serializers.DecimalField(max_digits=12, decimal_places=2)

    period2_label = serializers.CharField()
    period2_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    period2_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    period2_net = serializers.DecimalField(max_digits=12, decimal_places=2)

    revenue_variation = serializers.DecimalField(max_digits=6, decimal_places=2)
    expenses_variation = serializers.DecimalField(max_digits=6, decimal_places=2)
    net_variation = serializers.DecimalField(max_digits=6, decimal_places=2)

    analysis = serializers.CharField()
