from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour DRF
    """
    # Appel du gestionnaire par défaut
    response = exception_handler(exc, context)

    # Gérer les ValidationError de Django
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, 'error_dict'):
            # ValidationError avec plusieurs champs
            errors = {}
            for field, error_list in exc.error_dict.items():
                errors[field] = [str(e) for e in error_list]
            return Response(
                {'detail': 'Erreur de validation', 'errors': errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # ValidationError simple
            return Response(
                {'detail': 'Erreur de validation', 'errors': exc.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Log les erreurs 500
    if response is None:
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return Response(
            {'detail': 'Une erreur interne est survenue'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Ajouter des informations supplémentaires
    if response.status_code >= 500:
        logger.error(f"Server error: {str(exc)}", exc_info=True)

    return response


class ValidationError(Exception):
    """Exception de validation personnalisée"""
    def __init__(self, message, errors=None):
        self.message = message
        self.errors = errors or {}
        super().__init__(self.message)


class PermissionDeniedError(Exception):
    """Exception de permission refusée"""
    def __init__(self, message="Vous n'avez pas la permission d'effectuer cette action"):
        self.message = message
        super().__init__(self.message)


class ResourceNotFoundError(Exception):
    """Exception de ressource non trouvée"""
    def __init__(self, resource_type, resource_id=None):
        if resource_id:
            self.message = f"{resource_type} avec l'ID {resource_id} n'a pas été trouvé"
        else:
            self.message = f"{resource_type} n'a pas été trouvé"
        super().__init__(self.message)
