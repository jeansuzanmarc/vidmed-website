from functools import wraps
from django.core.cache import cache
from django.utils.encoding import force_str
import hashlib
import json


class CacheService:
    """
    Service de gestion du cache Redis avec TTL optimaux
    """

    # TTL en secondes
    TTL_DASHBOARD = 300         # 5 minutes - tableau de bord
    TTL_CODES = 3600           # 1 heure - codes de compte (changent rarement)
    TTL_STATS = 600            # 10 minutes - statistiques
    TTL_MONTHLY = 1800         # 30 minutes - rapports mensuels
    TTL_DEBTS = 600            # 10 minutes - liste des dettes
    TTL_USER_PROFILE = 1800    # 30 minutes - profil utilisateur
    TTL_FILTERS = 3600         # 1 heure - filtres sauvegardés

    @staticmethod
    def generate_key(*args, **kwargs):
        """
        Génère une clé de cache unique basée sur les arguments
        """
        key_data = {
            'args': args,
            'kwargs': kwargs
        }
        key_string = json.dumps(key_data, sort_keys=True, default=str)
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        return key_hash

    @staticmethod
    def cache_view(timeout=300, key_prefix='view'):
        """
        Décorateur pour cacher les vues Django

        Usage:
            @CacheService.cache_view(timeout=600, key_prefix='dashboard')
            @api_view(['GET'])
            def dashboard_view(request, clinic_id):
                ...
        """
        def decorator(func):
            @wraps(func)
            def wrapper(request, *args, **kwargs):
                # Générer la clé de cache
                cache_key_parts = [
                    key_prefix,
                    func.__name__,
                    str(request.user.id),
                    request.GET.urlencode(),
                    str(args),
                    str(kwargs)
                ]
                cache_key = CacheService.generate_key(*cache_key_parts)

                # Vérifier le cache
                cached_data = cache.get(cache_key)
                if cached_data is not None:
                    return cached_data

                # Exécuter la fonction
                result = func(request, *args, **kwargs)

                # Mettre en cache le résultat
                cache.set(cache_key, result, timeout)

                return result

            return wrapper
        return decorator

    @staticmethod
    def cache_queryset(timeout=300, key_prefix='queryset'):
        """
        Décorateur pour cacher les querysets

        Usage:
            @CacheService.cache_queryset(timeout=600, key_prefix='account_codes')
            def get_active_account_codes(clinic_id):
                return AccountCode.objects.filter(is_active=True)
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                cache_key = f"{key_prefix}:{CacheService.generate_key(*args, **kwargs)}"

                cached_data = cache.get(cache_key)
                if cached_data is not None:
                    return cached_data

                result = func(*args, **kwargs)
                cache.set(cache_key, result, timeout)

                return result

            return wrapper
        return decorator

    @staticmethod
    def invalidate_clinic_cache(clinic_id):
        """
        Invalider tout le cache d'une clinique
        """
        patterns = [
            f'dashboard:{clinic_id}',
            f'cash_flow:{clinic_id}',
            f'monthly_summary:{clinic_id}',
            f'debts:{clinic_id}',
            f'company_debts:{clinic_id}',
            f'stats:{clinic_id}',
        ]
        cache.delete_many(patterns)

    @staticmethod
    def invalidate_user_cache(user_id):
        """
        Invalider le cache d'un utilisateur
        """
        patterns = [
            f'user_profile:{user_id}',
            f'filters:{user_id}',
        ]
        cache.delete_many(patterns)

    @staticmethod
    def get_or_set(key, callback, timeout=300):
        """
        Obtenir une valeur du cache ou l'exécuter et la mettre en cache

        Usage:
            data = CacheService.get_or_set(
                f'dashboard:{clinic_id}',
                lambda: calculate_dashboard_data(clinic_id),
                timeout=CacheService.TTL_DASHBOARD
            )
        """
        cached_value = cache.get(key)
        if cached_value is not None:
            return cached_value

        value = callback()
        cache.set(key, value, timeout)
        return value

    @staticmethod
    def set_many(data_dict, timeout=300):
        """
        Définir plusieurs valeurs en cache en une seule fois

        Usage:
            CacheService.set_many({
                'key1': value1,
                'key2': value2,
            }, timeout=600)
        """
        cache.set_many(data_dict, timeout)

    @staticmethod
    def delete_pattern(pattern):
        """
        Supprimer toutes les clés correspondant à un pattern
        Note: Nécessite redis-py avec support SCAN
        """
        try:
            from django_redis import get_redis_connection
            conn = get_redis_connection("default")
            keys = conn.keys(f"vidmed:{pattern}*")
            if keys:
                conn.delete(*keys)
        except Exception as e:
            # Fallback silencieux si la suppression par pattern échoue
            pass
