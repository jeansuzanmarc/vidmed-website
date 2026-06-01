from rest_framework import permissions


class IsGrandSuperuser(permissions.BasePermission):
    """
    Permission: seulement Grand Superuser
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'grand_superuser'


class IsSuperuserOrAbove(permissions.BasePermission):
    """
    Permission: Superuser ou Grand Superuser
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['superuser', 'grand_superuser']
        )


class IsManagerOrAbove(permissions.BasePermission):
    """
    Permission: Manager, Superuser ou Grand Superuser
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['manager', 'superuser', 'grand_superuser']
        )


class CanManageDailyReports(permissions.BasePermission):
    """
    Permission: Manager peut créer/modifier ses rapports
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Grand superuser: tout
        if request.user.role == 'grand_superuser':
            return True

        # Superuser: lecture seule
        if request.user.role == 'superuser':
            return request.method in permissions.SAFE_METHODS

        # Manager: seulement ses propres rapports
        if request.user.role == 'manager':
            return obj.submitted_by == request.user

        return False


class CanManageExpenses(permissions.BasePermission):
    """
    Permission: Manager et Superuser peuvent gérer les dépenses
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['manager', 'superuser', 'grand_superuser']
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'grand_superuser':
            return True

        if request.user.role == 'superuser':
            return True

        # Manager: seulement de sa clinique
        if request.user.role == 'manager':
            return obj.clinic == request.user.clinic

        return False


class CanManagePatientDebts(permissions.BasePermission):
    """
    Permission: Manager peut gérer les dettes patients
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role in ['superuser', 'grand_superuser']:
            return True

        # Manager: seulement de sa clinique
        if request.user.role == 'manager':
            return obj.clinic == request.user.clinic

        return False


class CanManageCompanyDebts(permissions.BasePermission):
    """
    Permission: Seulement Superuser et Grand Superuser
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['superuser', 'grand_superuser']
        )

    def has_object_permission(self, request, view, obj):
        return request.user.role in ['superuser', 'grand_superuser']


class CanManageOwnerTransactions(permissions.BasePermission):
    """
    Permission: Seulement Superuser et Grand Superuser
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['superuser', 'grand_superuser']
        )


class CanManageUsers(permissions.BasePermission):
    """
    Permission: Seulement Grand Superuser peut créer/modifier users
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'grand_superuser'


class CanManageAccountCodes(permissions.BasePermission):
    """
    Permission: Seulement Grand Superuser peut créer/modifier codes de compte
    """
    def has_permission(self, request, view):
        # Lecture: tout le monde authentifié
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Écriture: seulement Grand Superuser
        return request.user and request.user.is_authenticated and request.user.role == 'grand_superuser'


class CanViewHistory(permissions.BasePermission):
    """
    Permission: Seulement Superuser et Grand Superuser peuvent voir l'historique
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['superuser', 'grand_superuser']
        )
