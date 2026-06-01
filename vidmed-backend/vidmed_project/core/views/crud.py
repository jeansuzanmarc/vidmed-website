from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from core.models import (
    User, Clinic, AccountCode, DailyReport, Expense,
    Debt, DebtPayment, CompanyDebt, CompanyDebtPayment,
    OwnerTransaction, Alert, SavedFilter
)
from core.serializers import (
    UserSerializer, ClinicSerializer, AccountCodeSerializer,
    DailyReportSerializer, ExpenseSerializer, DebtSerializer,
    DebtPaymentSerializer, CompanyDebtSerializer,
    CompanyDebtPaymentSerializer, OwnerTransactionSerializer,
    AlertSerializer, SavedFilterSerializer
)
from core.permissions import (
    IsGrandSuperuser, IsSuperuserOrAbove, IsManagerOrAbove,
    CanManageDailyReports, CanManageExpenses, CanManagePatientDebts,
    CanManageCompanyDebts, CanManageOwnerTransactions,
    CanManageUsers, CanManageAccountCodes
)
from services.cache_service import CacheService


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les utilisateurs
    Grand Superuser uniquement
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [CanManageUsers]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'clinic']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']
    ordering = ['-date_joined']


class ClinicViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les cliniques
    """
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer
    permission_classes = [IsGrandSuperuser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'address', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AccountCodeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les codes de compte
    Lecture: tous, Écriture: Grand Superuser uniquement
    """
    queryset = AccountCode.objects.filter(is_active=True)
    serializer_class = AccountCodeSerializer
    permission_classes = [CanManageAccountCodes]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account_type', 'category', 'is_active']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'category']
    ordering = ['code']

    @CacheService.cache_view(timeout=CacheService.TTL_CODES, key_prefix='account_codes')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class DailyReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rapports journaliers
    Manager: créer/modifier ses rapports
    Superuser: lecture seule
    """
    serializer_class = DailyReportSerializer
    permission_classes = [CanManageDailyReports]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['clinic', 'report_date', 'submitted_by']
    ordering_fields = ['report_date', 'created_at']
    ordering = ['-report_date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'grand_superuser':
            return DailyReport.objects.all()
        elif user.role == 'superuser':
            return DailyReport.objects.all()
        else:  # manager
            return DailyReport.objects.filter(clinic=user.clinic)

    def perform_create(self, serializer):
        serializer.save(
            submitted_by=self.request.user,
            clinic=self.request.user.clinic
        )


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les dépenses
    """
    serializer_class = ExpenseSerializer
    permission_classes = [CanManageExpenses]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['clinic', 'account_code', 'expense_date']
    search_fields = ['description']
    ordering_fields = ['expense_date', 'amount', 'created_at']
    ordering = ['-expense_date']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['superuser', 'grand_superuser']:
            return Expense.objects.all()
        else:  # manager
            return Expense.objects.filter(clinic=user.clinic)

    def perform_create(self, serializer):
        if self.request.user.role == 'manager':
            serializer.save(
                recorded_by=self.request.user,
                clinic=self.request.user.clinic
            )
        else:
            serializer.save(recorded_by=self.request.user)


class DebtViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les dettes patients (créances)
    Manager peut gérer
    """
    serializer_class = DebtSerializer
    permission_classes = [CanManagePatientDebts]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['clinic', 'is_paid', 'debt_date', 'due_date']
    search_fields = ['debtor_name', 'debtor_phone', 'description']
    ordering_fields = ['debt_date', 'due_date', 'remaining_amount']
    ordering = ['-debt_date']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['superuser', 'grand_superuser']:
            return Debt.objects.all()
        else:  # manager
            return Debt.objects.filter(clinic=user.clinic)

    def perform_create(self, serializer):
        if self.request.user.role == 'manager':
            serializer.save(
                created_by=self.request.user,
                clinic=self.request.user.clinic
            )
        else:
            serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Liste des dettes en retard"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            is_paid=False,
            due_date__lt=today
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DebtPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les paiements de dettes patients
    """
    serializer_class = DebtPaymentSerializer
    permission_classes = [CanManagePatientDebts]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['debt', 'payment_date']
    ordering_fields = ['payment_date', 'amount']
    ordering = ['-payment_date']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['superuser', 'grand_superuser']:
            return DebtPayment.objects.all()
        else:  # manager
            return DebtPayment.objects.filter(debt__clinic=user.clinic)

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class CompanyDebtViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les dettes entreprise (passif)
    Superuser et Grand Superuser uniquement
    """
    serializer_class = CompanyDebtSerializer
    permission_classes = [CanManageCompanyDebts]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['clinic', 'debt_type', 'is_paid', 'debt_date', 'due_date']
    search_fields = ['creditor_name', 'creditor_phone', 'description']
    ordering_fields = ['debt_date', 'due_date', 'remaining_amount']
    ordering = ['-debt_date']

    def get_queryset(self):
        return CompanyDebt.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Liste des dettes entreprise en retard"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            is_paid=False,
            due_date__lt=today
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CompanyDebtPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les paiements de dettes entreprise
    """
    serializer_class = CompanyDebtPaymentSerializer
    permission_classes = [CanManageCompanyDebts]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['company_debt', 'payment_date']
    ordering_fields = ['payment_date', 'amount']
    ordering = ['-payment_date']

    def get_queryset(self):
        return CompanyDebtPayment.objects.all()

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class OwnerTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les transactions propriétaire (apports/retraits)
    Superuser et Grand Superuser uniquement
    """
    serializer_class = OwnerTransactionSerializer
    permission_classes = [CanManageOwnerTransactions]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['clinic', 'transaction_type', 'transaction_date']
    ordering_fields = ['transaction_date', 'amount']
    ordering = ['-transaction_date']

    def get_queryset(self):
        return OwnerTransaction.objects.all()

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les alertes
    """
    serializer_class = AlertSerializer
    permission_classes = [IsManagerOrAbove]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['clinic', 'alert_type', 'alert_level', 'is_resolved']
    ordering_fields = ['alert_date', 'created_at']
    ordering = ['-alert_date', '-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['superuser', 'grand_superuser']:
            return Alert.objects.all()
        else:  # manager
            return Alert.objects.filter(clinic=user.clinic)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Marquer une alerte comme résolue"""
        alert = self.get_object()
        alert.is_resolved = True
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user
        alert.save()
        serializer = self.get_serializer(alert)
        return Response(serializer.data)


class SavedFilterViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les filtres sauvegardés
    """
    serializer_class = SavedFilterSerializer
    permission_classes = [IsManagerOrAbove]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['filter_type', 'is_default']
    ordering = ['name']

    def get_queryset(self):
        # Un utilisateur ne voit que ses propres filtres
        return SavedFilter.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
