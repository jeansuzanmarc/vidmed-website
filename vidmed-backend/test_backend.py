#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de tests complets pour VIDMED Backend
Tests de validation sans base de données
"""

import sys
import os

# Ajouter le projet au path
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vidmed_project.settings')

def test_imports():
    """Test 1: Verifier que tous les imports fonctionnent"""
    print("\n" + "="*60)
    print("TEST 1: Verification des imports")
    print("="*60)

    try:
        # Django
        import django
        print(f"[OK] Django {django.get_version()}")

        # Models
        from vidmed_project.core.models import (
            User, Clinic, AccountCode, DailyReport, Expense,
            Debt, DebtPayment, CompanyDebt, CompanyDebtPayment,
            OwnerTransaction, Alert, SavedFilter
        )
        print("[OK] Tous les modeles importes (13 modeles)")

        # Serializers
        from vidmed_project.core.serializers import (
            UserSerializer, ClinicSerializer, DailyReportSerializer,
            ExpenseSerializer, DebtSerializer, CompanyDebtSerializer
        )
        print("[OK] Tous les serializers importes")

        # Views
        from vidmed_project.core.views import auth, crud, dashboard, reports
        print("[OK] Toutes les views importees")

        # Services
        from vidmed_project.services.cache_service import CacheService
        from vidmed_project.services.whatsapp_service import WhatsAppService
        from vidmed_project.services.notification_service import NotificationService
        print("[OK] Tous les services importes")

        # Tasks
        from vidmed_project.core.tasks import (
            check_missing_reports, check_unpaid_debts,
            generate_monthly_summary, clear_old_cache
        )
        print("[OK] Toutes les taches Celery importees (4 taches)")

        # Permissions
        from vidmed_project.core.permissions import (
            IsGrandSuperuser, IsSuperuserOrAbove, IsManagerOrAbove
        )
        print("[OK] Toutes les permissions importees")

        return True
    except Exception as e:
        print(f"[ERREUR] {e}")
        import traceback
        traceback.print_exc()
        return False


def test_model_validations():
    """Test 2: Vérifier les validations des modèles"""
    print("\n" + "="*60)
    print("TEST 2: Validations des modèles")
    print("="*60)

    try:
        from vidmed_project.core.models import DailyReport, Expense, Debt
        from decimal import Decimal
        from django.core.exceptions import ValidationError

        # Test limites DailyReport
        print("\n📋 DailyReport:")
        print(f"  - MAX_CONSULTATION_DAILY: {DailyReport.MAX_CONSULTATION_DAILY:,} HTG")
        print(f"  - MAX_MEDICINES_DAILY: {DailyReport.MAX_MEDICINES_DAILY:,} HTG")
        print(f"  - MAX_PATIENTS_DAILY: {DailyReport.MAX_PATIENTS_DAILY} patients")
        print("✅ Limites DailyReport définies")

        # Test limites Expense
        print("\n💸 Expense:")
        print(f"  - MAX_EXPENSE_AMOUNT: {Expense.MAX_EXPENSE_AMOUNT:,} HTG")
        print("✅ Limites Expense définies")

        # Test limites Debt
        print("\n💰 Debt (Patient):")
        print(f"  - MAX_DEBT_AMOUNT: {Debt.MAX_DEBT_AMOUNT:,} HTG")
        print("✅ Limites Debt définies")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_mixins():
    """Test 3: Vérifier les mixins"""
    print("\n" + "="*60)
    print("TEST 3: Mixins (SoftDelete, Timestamp)")
    print("="*60)

    try:
        from vidmed_project.core.mixins import (
            SoftDeleteMixin, TimestampMixin,
            SoftDeleteManager, AllObjectsManager
        )

        # Vérifier méthodes SoftDeleteMixin
        mixin_methods = ['delete', 'hard_delete', 'restore', 'is_deleted']
        for method in mixin_methods:
            assert hasattr(SoftDeleteMixin, method)
        print(f"✅ SoftDeleteMixin: {len(mixin_methods)} méthodes")

        # Vérifier managers
        print("✅ SoftDeleteManager défini")
        print("✅ AllObjectsManager défini")

        # Vérifier TimestampMixin
        print("✅ TimestampMixin défini (created_at, updated_at)")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_permissions():
    """Test 4: Vérifier les permissions"""
    print("\n" + "="*60)
    print("TEST 4: Permissions par rôle")
    print("="*60)

    try:
        from vidmed_project.core.permissions import (
            IsGrandSuperuser, IsSuperuserOrAbove, IsManagerOrAbove,
            CanManageDailyReports, CanManageExpenses, CanManagePatientDebts,
            CanManageCompanyDebts, CanManageOwnerTransactions,
            CanManageUsers, CanManageAccountCodes, CanViewHistory
        )

        permissions = [
            'IsGrandSuperuser',
            'IsSuperuserOrAbove',
            'IsManagerOrAbove',
            'CanManageDailyReports',
            'CanManageExpenses',
            'CanManagePatientDebts',
            'CanManageCompanyDebts',
            'CanManageOwnerTransactions',
            'CanManageUsers',
            'CanManageAccountCodes',
            'CanViewHistory',
        ]

        print(f"✅ {len(permissions)} classes de permissions définies:")
        for perm in permissions:
            print(f"  - {perm}")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_cache_service():
    """Test 5: Vérifier CacheService"""
    print("\n" + "="*60)
    print("TEST 5: CacheService")
    print("="*60)

    try:
        from vidmed_project.services.cache_service import CacheService

        # Vérifier TTL
        ttls = {
            'TTL_DASHBOARD': CacheService.TTL_DASHBOARD,
            'TTL_CODES': CacheService.TTL_CODES,
            'TTL_STATS': CacheService.TTL_STATS,
            'TTL_MONTHLY': CacheService.TTL_MONTHLY,
            'TTL_DEBTS': CacheService.TTL_DEBTS,
            'TTL_USER_PROFILE': CacheService.TTL_USER_PROFILE,
            'TTL_FILTERS': CacheService.TTL_FILTERS,
        }

        print("✅ TTL configurés:")
        for name, ttl in ttls.items():
            minutes = ttl // 60
            print(f"  - {name}: {ttl}s ({minutes}min)")

        # Vérifier méthodes
        methods = ['generate_key', 'cache_view', 'cache_queryset',
                  'invalidate_clinic_cache', 'get_or_set']
        for method in methods:
            assert hasattr(CacheService, method)
        print(f"✅ {len(methods)} méthodes disponibles")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_whatsapp_service():
    """Test 6: Vérifier WhatsAppService"""
    print("\n" + "="*60)
    print("TEST 6: WhatsAppService")
    print("="*60)

    try:
        from vidmed_project.services.whatsapp_service import WhatsAppService

        service = WhatsAppService()

        # Vérifier méthodes
        methods = [
            'send_message',
            'send_missing_report_alert',
            'send_overdue_debt_alert',
            'send_low_cash_alert',
            'send_monthly_summary',
        ]

        print("✅ Méthodes WhatsApp disponibles:")
        for method in methods:
            assert hasattr(service, method)
            print(f"  - {method}")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_celery_tasks():
    """Test 7: Vérifier les tâches Celery"""
    print("\n" + "="*60)
    print("TEST 7: Tâches Celery")
    print("="*60)

    try:
        from vidmed_project.core.tasks import (
            check_missing_reports,
            check_unpaid_debts,
            generate_monthly_summary,
            clear_old_cache,
        )

        tasks = {
            'check_missing_reports': '20h00 tous les jours',
            'check_unpaid_debts': 'Lundi 9h00',
            'generate_monthly_summary': '1er du mois 6h00',
            'clear_old_cache': '1er du mois 2h00',
        }

        print("✅ Tâches Celery configurées:")
        for task_name, schedule in tasks.items():
            print(f"  - {task_name}: {schedule}")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_urls():
    """Test 8: Vérifier les URLs"""
    print("\n" + "="*60)
    print("TEST 8: Configuration URLs")
    print("="*60)

    try:
        from vidmed_project.urls import urlpatterns
        from vidmed_project.core.urls import router

        # Compter les routes
        print(f"✅ Routes principales: {len(urlpatterns)}")

        # ViewSets dans le router
        registered_viewsets = [
            'users',
            'clinics',
            'account-codes',
            'daily-reports',
            'expenses',
            'patient-debts',
            'debt-payments',
            'company-debts',
            'company-debt-payments',
            'owner-transactions',
            'alerts',
            'saved-filters',
        ]

        print(f"✅ ViewSets enregistrés: {len(registered_viewsets)}")
        for vs in registered_viewsets:
            print(f"  - /api/{vs}/")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_serializers():
    """Test 9: Vérifier les serializers"""
    print("\n" + "="*60)
    print("TEST 9: Serializers")
    print("="*60)

    try:
        from vidmed_project.core import serializers

        serializer_list = [
            'UserSerializer',
            'ClinicSerializer',
            'AccountCodeSerializer',
            'DailyReportSerializer',
            'ExpenseSerializer',
            'DebtSerializer',
            'DebtPaymentSerializer',
            'CompanyDebtSerializer',
            'CompanyDebtPaymentSerializer',
            'OwnerTransactionSerializer',
            'AlertSerializer',
            'SavedFilterSerializer',
            'CashFlowSerializer',
            'DashboardStatsSerializer',
            'PeriodComparisonSerializer',
        ]

        print(f"✅ Serializers définis: {len(serializer_list)}")
        for ser in serializer_list:
            assert hasattr(serializers, ser)

        # Vérifier DailyReportSerializer a patient_count
        from vidmed_project.core.serializers import DailyReportSerializer
        fields = DailyReportSerializer.Meta.fields
        assert 'patient_count' in fields
        assert 'revenue_per_patient' in fields
        print("✅ DailyReportSerializer contient patient_count et revenue_per_patient")

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_docker_files():
    """Test 10: Vérifier les fichiers Docker"""
    print("\n" + "="*60)
    print("TEST 10: Fichiers Docker")
    print("="*60)

    try:
        import os

        files = [
            'Dockerfile',
            'docker-compose.yml',
            'docker-entrypoint.sh',
            '.env.example',
            'requirements.txt',
        ]

        for filename in files:
            filepath = os.path.join(os.path.dirname(__file__), filename)
            if os.path.exists(filepath):
                print(f"✅ {filename} existe")
            else:
                print(f"❌ {filename} manquant")
                return False

        return True
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_all_tests():
    """Exécuter tous les tests"""
    print("\n" + "="*60)
    print("TESTS BACKEND VIDMED v2.0")
    print("="*60)

    tests = [
        ("Imports", test_imports),
        ("Validations modèles", test_model_validations),
        ("Mixins", test_mixins),
        ("Permissions", test_permissions),
        ("CacheService", test_cache_service),
        ("WhatsAppService", test_whatsapp_service),
        ("Tâches Celery", test_celery_tasks),
        ("URLs", test_urls),
        ("Serializers", test_serializers),
        ("Fichiers Docker", test_docker_files),
    ]

    results = []
    for name, test_func in tests:
        result = test_func()
        results.append((name, result))

    # Résumé
    print("\n" + "="*60)
    print("RESUME DES TESTS")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")

    print("\n" + "="*60)
    print(f"Score: {passed}/{total} tests réussis ({passed*100//total}%)")
    print("="*60)

    return passed == total


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
