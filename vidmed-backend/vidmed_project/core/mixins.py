from django.db import models
from django.utils import timezone


class SoftDeleteMixin(models.Model):
    """
    Mixin pour soft delete - les objets supprimés ne sont pas réellement effacés
    mais marqués comme deleted_at != NULL
    """
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    deleted_by = models.ForeignKey(
        'User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='%(class)s_deleted'
    )

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """Soft delete - marquer comme supprimé"""
        self.deleted_at = timezone.now()
        self.save(using=using)

    def hard_delete(self):
        """Suppression définitive de la base de données"""
        super().delete()

    def restore(self):
        """Restaurer un objet supprimé"""
        self.deleted_at = None
        self.deleted_by = None
        self.save()

    @property
    def is_deleted(self):
        return self.deleted_at is not None


class SoftDeleteManager(models.Manager):
    """Manager qui exclut automatiquement les objets supprimés"""

    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class AllObjectsManager(models.Manager):
    """Manager pour accéder à TOUS les objets (incluant supprimés)"""

    def get_queryset(self):
        return super().get_queryset()


class TimestampMixin(models.Model):
    """Mixin pour timestamps automatiques"""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
