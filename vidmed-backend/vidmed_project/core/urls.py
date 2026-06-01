from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import crud, dashboard, reports

router = DefaultRouter()
router.register(r'users', crud.UserViewSet, basename='user')
router.register(r'clinics', crud.ClinicViewSet, basename='clinic')
router.register(r'account-codes', crud.AccountCodeViewSet, basename='account-code')
router.register(r'daily-reports', crud.DailyReportViewSet, basename='daily-report')
router.register(r'expenses', crud.ExpenseViewSet, basename='expense')
router.register(r'patient-debts', crud.DebtViewSet, basename='patient-debt')
router.register(r'debt-payments', crud.DebtPaymentViewSet, basename='debt-payment')
router.register(r'company-debts', crud.CompanyDebtViewSet, basename='company-debt')
router.register(r'company-debt-payments', crud.CompanyDebtPaymentViewSet, basename='company-debt-payment')
router.register(r'owner-transactions', crud.OwnerTransactionViewSet, basename='owner-transaction')
router.register(r'alerts', crud.AlertViewSet, basename='alert')
router.register(r'saved-filters', crud.SavedFilterViewSet, basename='saved-filter')

urlpatterns = [
    path('', include(router.urls)),

    # Dashboard & Statistics
    path('dashboard/<int:clinic_id>/', dashboard.dashboard_view, name='dashboard'),
    path('cash-flow/<int:clinic_id>/', dashboard.cash_flow_view, name='cash-flow'),

    # Period Comparison
    path('comparison/<int:clinic_id>/', reports.period_comparison_view, name='period-comparison'),

    # Legal Accounting
    path('balance-generale/<int:clinic_id>/', reports.balance_generale_view, name='balance-generale'),
    path('grand-livre/<int:clinic_id>/', reports.grand_livre_view, name='grand-livre'),

    # History/Audit
    path('history/<str:model_name>/<int:object_id>/', dashboard.history_view, name='history'),
]
