# 🚀 Plan d'Implémentation Optimale - VIDMED v2.0

**Date:** 1er juin 2026  
**Objectif:** Système production-ready avec TOUTES les optimisations  
**Déploiement:** GitHub + Render (gratuit)

---

## 📋 Liste Complète des Améliorations

### 🔴 PRIORITÉ CRITIQUE (À implémenter MAINTENANT)

#### 1. Vue Matérialisée au lieu de CashFlowTransaction ✅
**Problème actuel:**
- Table redondante qui duplique données
- Risque désynchronisation si signaux échouent
- Maintenance complexe

**Solution:**
```sql
CREATE VIEW cash_flow_view AS
SELECT 
  'revenue' as source,
  dr.clinic_id,
  dr.report_date as transaction_date,
  ac.id as account_code_id,
  'in' as flow_type,
  CASE ac.code
    WHEN 'REV_CONSULTATION' THEN dr.consultations
    WHEN 'REV_PHARMACIE' THEN dr.medicines
    WHEN 'REV_EXAMEN' THEN dr.exams
    WHEN 'REV_AUTRE' THEN dr.other_services
  END as amount,
  dr.created_by_id,
  dr.created_at
FROM daily_reports dr
CROSS JOIN account_codes ac
WHERE ac.code IN ('REV_CONSULTATION', 'REV_PHARMACIE', 'REV_EXAMEN', 'REV_AUTRE')
  AND (
    (ac.code = 'REV_CONSULTATION' AND dr.consultations > 0)
    OR (ac.code = 'REV_PHARMACIE' AND dr.medicines > 0)
    OR (ac.code = 'REV_EXAMEN' AND dr.exams > 0)
    OR (ac.code = 'REV_AUTRE' AND dr.other_services > 0)
  )

UNION ALL

SELECT 
  'expense' as source,
  e.clinic_id,
  e.expense_date,
  e.account_code_id,
  'out',
  e.amount,
  e.created_by_id,
  e.created_at
FROM expenses e

UNION ALL

SELECT 
  'debt_payment',
  d.clinic_id,
  dp.payment_date,
  (SELECT id FROM account_codes WHERE code = 'REC_DETTE'),
  'in',
  dp.amount,
  dp.recorded_by_id,
  dp.created_at
FROM debt_payments dp
JOIN debts d ON dp.debt_id = d.id

-- ... etc pour les autres
```

**Avantages:**
- ✅ Pas de duplication données
- ✅ Toujours synchronisé (impossible désync)
- ✅ Moins d'espace disque
- ✅ Pas de maintenance signaux

---

#### 2. Soft Delete avec deleted_at ✅
**Problème actuel:**
- Suppression = perte définitive
- Pas d'historique
- Impossible de restaurer

**Solution:**
```python
# Mixin pour tous les modèles
class SoftDeleteMixin(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    deleted_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='%(class)s_deleted'
    )
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False):
        """Soft delete au lieu de vraie suppression"""
        self.deleted_at = timezone.now()
        self.save()
    
    def hard_delete(self):
        """Vraie suppression (admin seulement)"""
        super().delete()
    
    def restore(self):
        """Restaurer un élément supprimé"""
        self.deleted_at = None
        self.deleted_by = None
        self.save()

# Manager personnalisé
class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)
    
    def with_deleted(self):
        return super().get_queryset()
    
    def deleted_only(self):
        return super().get_queryset().filter(deleted_at__isnull=False)

# Utilisation
class DailyReport(SoftDeleteMixin):
    objects = SoftDeleteManager()
    all_objects = models.Manager()  # Inclut les supprimés
```

**Avantages:**
- ✅ Rien n'est jamais perdu
- ✅ Peut restaurer
- ✅ Historique complet
- ✅ Conformité RGPD (droit à l'oubli)

---

#### 3. Versioning avec django-simple-history ✅
**Problème actuel:**
- Modifications écrasent anciennes données
- Pas d'audit trail
- Impossible de voir qui a changé quoi

**Solution:**
```python
# Installation
pip install django-simple-history

# Configuration
INSTALLED_APPS = [
    ...
    'simple_history',
]

MIDDLEWARE = [
    ...
    'simple_history.middleware.HistoryRequestMiddleware',
]

# Modèle avec historique
from simple_history.models import HistoricalRecords

class DailyReport(SoftDeleteMixin):
    # ... champs normaux
    history = HistoricalRecords()

# Utilisation
report = DailyReport.objects.get(id=1)

# Voir historique
for historical_report in report.history.all():
    print(f"{historical_report.history_date}: {historical_report.history_type}")
    print(f"Modifié par: {historical_report.history_user}")
    print(f"Total: {historical_report.total_services}")

# Restaurer version ancienne
old_version = report.history.as_of(date(2026, 5, 15))
report.consultations = old_version.consultations
report.save()
```

**Avantages:**
- ✅ Historique complet de toutes modifications
- ✅ Qui a changé quoi et quand
- ✅ Peut restaurer versions anciennes
- ✅ Conformité audit

---

#### 4. Validation Montants Aberrants ✅
**Problème actuel:**
- Peut entrer 100M HTG pour une consultation
- Pas de limites réalistes

**Solution:**
```python
from django.core.exceptions import ValidationError

class DailyReport(models.Model):
    # Limites réalistes par service
    MAX_CONSULTATION_DAILY = Decimal('500000')  # 500k HTG max/jour
    MAX_MEDICINES_DAILY = Decimal('2000000')    # 2M HTG max/jour
    MAX_EXAMS_DAILY = Decimal('500000')
    MAX_OTHER_DAILY = Decimal('300000')
    
    def clean(self):
        super().clean()
        
        if self.consultations > self.MAX_CONSULTATION_DAILY:
            raise ValidationError({
                'consultations': f'Montant aberrant. Maximum réaliste: {self.MAX_CONSULTATION_DAILY} HTG/jour'
            })
        
        if self.medicines > self.MAX_MEDICINES_DAILY:
            raise ValidationError({
                'medicines': f'Montant aberrant. Maximum réaliste: {self.MAX_MEDICINES_DAILY} HTG/jour'
            })
        
        # Vérifier aussi cohérence
        if self.consultations == 0 and self.medicines > 1000000:
            raise ValidationError({
                'medicines': 'Incohérent: beaucoup de médicaments mais aucune consultation'
            })

class Expense(models.Model):
    MAX_EXPENSE_SINGLE = Decimal('1000000')  # 1M HTG max par dépense
    
    def clean(self):
        if self.amount > self.MAX_EXPENSE_SINGLE:
            raise ValidationError({
                'amount': f'Dépense trop élevée ({self.amount}). Si correct, contactez administrateur.'
            })
```

**Frontend validation:**
```typescript
const validateAmount = (value: number, field: string): string | null => {
  const limits = {
    consultations: 500000,
    medicines: 2000000,
    exams: 500000,
    other_services: 300000,
    expense: 1000000
  };
  
  if (value > limits[field]) {
    return `Montant très élevé (${value.toLocaleString()} HTG). Vérifiez la saisie.`;
  }
  
  return null;
};
```

---

#### 5. Pagination Automatique Optimale ✅
**Problème actuel:**
- Peut charger 10,000 rapports d'un coup
- Ralentissements

**Solution:**
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'MAX_PAGE_SIZE': 200,
}

# Pagination personnalisée avec métadonnées
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class OptimizedPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.page_size,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

# ViewSet
class DailyReportViewSet(viewsets.ModelViewSet):
    pagination_class = OptimizedPagination
    
    def get_queryset(self):
        # Optimisation requêtes
        return DailyReport.objects.select_related(
            'clinic', 'created_by'
        ).prefetch_related(
            'expenses__account_code'
        ).order_by('-report_date')
```

**Frontend (React):**
```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(50);

const { data, loading } = useQuery(
  ['reports', page, pageSize],
  () => api.get(`/api/reports/?page=${page}&page_size=${pageSize}`)
);

// Infinite scroll
const loadMore = () => {
  if (data.next) {
    setPage(page + 1);
  }
};
```

---

#### 6. Cache Redis OPTIMAL ✅
**Configuration complète:**

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True
            }
        },
        'KEY_PREFIX': 'vidmed',
        'TIMEOUT': 300,  # 5 min par défaut
    }
}

# Service cache optimisé
from django.core.cache import cache
from functools import wraps
import hashlib
import json

class CacheService:
    # TTL par type de données
    TTL_DASHBOARD = 300        # 5 min - Dashboard cash-flow
    TTL_CODES = 3600          # 1h - Liste codes comptes
    TTL_STATS = 600           # 10 min - Statistiques
    TTL_REPORTS_LIST = 180    # 3 min - Liste rapports
    TTL_USER_PERMS = 1800     # 30 min - Permissions utilisateur
    
    @staticmethod
    def generate_key(*args, **kwargs):
        """Génère clé unique basée sur paramètres"""
        key_data = {
            'args': args,
            'kwargs': sorted(kwargs.items())
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    @staticmethod
    def cache_view(timeout=300, key_prefix='view'):
        """Décorateur pour cacher vue API"""
        def decorator(func):
            @wraps(func)
            def wrapper(request, *args, **kwargs):
                # Générer clé unique
                cache_key = f"{key_prefix}:{CacheService.generate_key(
                    request.user.id,
                    request.GET.dict(),
                    *args,
                    **kwargs
                )}"
                
                # Vérifier cache
                cached = cache.get(cache_key)
                if cached is not None:
                    return cached
                
                # Exécuter et cacher
                result = func(request, *args, **kwargs)
                cache.set(cache_key, result, timeout)
                return result
            return wrapper
        return decorator
    
    @staticmethod
    def invalidate_pattern(pattern):
        """Invalider tous les caches correspondant au pattern"""
        keys = cache.keys(f"vidmed:*{pattern}*")
        if keys:
            cache.delete_many(keys)

# Utilisation dans views
from rest_framework.decorators import api_view

@api_view(['GET'])
@CacheService.cache_view(timeout=CacheService.TTL_DASHBOARD, key_prefix='cash_flow')
def cash_flow_report(request):
    # Cette vue sera cachée 5 min
    ...

# Invalidation automatique
from django.db.models.signals import post_save

@receiver(post_save, sender=DailyReport)
def invalidate_cash_flow_cache(sender, instance, **kwargs):
    # Invalider cache de cette clinique
    CacheService.invalidate_pattern(f"cash_flow:*clinic_{instance.clinic_id}*")
```

**Monitoring cache:**
```python
@api_view(['GET'])
def cache_stats(request):
    """Statistiques cache Redis"""
    from django_redis import get_redis_connection
    
    conn = get_redis_connection("default")
    info = conn.info()
    
    return Response({
        'total_keys': info['db1']['keys'],
        'memory_used': info['used_memory_human'],
        'hit_rate': info.get('keyspace_hits', 0) / max(info.get('keyspace_misses', 1), 1),
        'uptime_days': info['uptime_in_days']
    })
```

---

#### 7. Comparaison Période N vs N-1 ✅
**Nouvelle fonctionnalité:**

```python
@api_view(['GET'])
def cash_flow_comparison(request):
    """
    Compare 2 périodes
    
    Params:
    - period1_start, period1_end
    - period2_start, period2_end
    - clinic (optional)
    """
    
    def get_period_data(start, end, clinic_id=None):
        filters = {
            'transaction_date__gte': start,
            'transaction_date__lte': end
        }
        if clinic_id:
            filters['clinic_id'] = clinic_id
        
        # Vue matérialisée
        inflows = CashFlowView.objects.filter(
            flow_type='in',
            **filters
        ).values('account_code__code', 'account_code__name').annotate(
            total=Sum('amount')
        )
        
        outflows = CashFlowView.objects.filter(
            flow_type='out',
            **filters
        ).values('account_code__code', 'account_code__name').annotate(
            total=Sum('amount')
        )
        
        total_in = sum(i['total'] for i in inflows)
        total_out = sum(o['total'] for o in outflows)
        
        return {
            'inflows': list(inflows),
            'outflows': list(outflows),
            'total_in': total_in,
            'total_out': total_out,
            'net': total_in - total_out
        }
    
    period1 = get_period_data(
        request.GET['period1_start'],
        request.GET['period1_end'],
        request.GET.get('clinic')
    )
    
    period2 = get_period_data(
        request.GET['period2_start'],
        request.GET['period2_end'],
        request.GET.get('clinic')
    )
    
    # Calculs variations
    variation_in = ((period2['total_in'] - period1['total_in']) / period1['total_in'] * 100) if period1['total_in'] > 0 else 0
    variation_out = ((period2['total_out'] - period1['total_out']) / period1['total_out'] * 100) if period1['total_out'] > 0 else 0
    variation_net = ((period2['net'] - period1['net']) / abs(period1['net']) * 100) if period1['net'] != 0 else 0
    
    return Response({
        'period1': period1,
        'period2': period2,
        'variations': {
            'inflows': {
                'absolute': period2['total_in'] - period1['total_in'],
                'percentage': round(variation_in, 2)
            },
            'outflows': {
                'absolute': period2['total_out'] - period1['total_out'],
                'percentage': round(variation_out, 2)
            },
            'net': {
                'absolute': period2['net'] - period1['net'],
                'percentage': round(variation_net, 2)
            }
        },
        'analysis': {
            'trend': 'positive' if variation_net > 0 else 'negative',
            'main_increase': max(
                [(k, v['total']) for k, v in period2['inflows'].items()],
                key=lambda x: x[1]
            )[0] if period2['inflows'] else None,
            'main_concern': max(
                [(k, v['total']) for k, v in period2['outflows'].items()],
                key=lambda x: x[1]
            )[0] if period2['outflows'] else None
        }
    })
```

**Frontend React:**
```typescript
const ComparisonChart: React.FC = () => {
  const [period1, setPeriod1] = useState({ start: '2026-04-01', end: '2026-04-30' });
  const [period2, setPeriod2] = useState({ start: '2026-05-01', end: '2026-05-30' });
  
  const { data } = useQuery(['comparison', period1, period2], () =>
    api.get('/api/cash-flow/comparison/', {
      params: {
        period1_start: period1.start,
        period1_end: period1.end,
        period2_start: period2.start,
        period2_end: period2.end
      }
    })
  );
  
  return (
    <Card>
      <Typography variant="h6">
        Comparaison Avril vs Mai 2026
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="subtitle2">Avril 2026</Typography>
              <Typography variant="h4">{data.period1.net.toLocaleString()} HTG</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6}>
          <Card sx={{ bgcolor: data.variations.net.percentage > 0 ? '#e8f5e9' : '#ffebee' }}>
            <CardContent>
              <Typography variant="subtitle2">Mai 2026</Typography>
              <Typography variant="h4">{data.period2.net.toLocaleString()} HTG</Typography>
              <Chip 
                label={`${data.variations.net.percentage > 0 ? '+' : ''}${data.variations.net.percentage}%`}
                color={data.variations.net.percentage > 0 ? 'success' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <BarChart data={[
        { name: 'Avril', entrées: data.period1.total_in, sorties: data.period1.total_out },
        { name: 'Mai', entrées: data.period2.total_in, sorties: data.period2.total_out }
      ]}>
        <Bar dataKey="entrées" fill="#4caf50" />
        <Bar dataKey="sorties" fill="#f44336" />
      </BarChart>
    </Card>
  );
};
```

---

#### 8. Filtres Favoris ✅
**Backend:**
```python
class SavedFilter(models.Model):
    """Sauvegarder filtres favoris utilisateur"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_filters')
    name = models.CharField(max_length=100)
    filter_type = models.CharField(max_length=50)  # 'cash_flow', 'reports', etc.
    filters = models.JSONField()  # {clinic: 1, start_date: '2026-05-01', ...}
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'name', 'filter_type']
```

**Frontend:**
```typescript
const FilterBar: React.FC = () => {
  const [savedFilters, setSavedFilters] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});
  
  const saveFilter = async (name: string) => {
    await api.post('/api/saved-filters/', {
      name,
      filter_type: 'cash_flow',
      filters: currentFilters
    });
  };
  
  const loadFilter = async (filterId: number) => {
    const filter = savedFilters.find(f => f.id === filterId);
    setCurrentFilters(filter.filters);
  };
  
  return (
    <Box>
      <Select value={selectedFilter} onChange={(e) => loadFilter(e.target.value)}>
        {savedFilters.map(f => (
          <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
        ))}
      </Select>
      <Button onClick={() => saveFilter('Mon filtre')}>💾 Sauvegarder</Button>
    </Box>
  );
};
```

---

#### 9. Notifications Push ✅
**Backend avec Firebase Cloud Messaging:**
```python
# Installation
pip install firebase-admin

# Modèle
class DeviceToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=20)  # 'web', 'android', 'ios'
    created_at = models.DateTimeField(auto_now_add=True)

# Service notifications
import firebase_admin
from firebase_admin import messaging

class NotificationService:
    @staticmethod
    def send_push(user, title, body, data=None):
        """Envoyer notification push"""
        tokens = DeviceToken.objects.filter(user=user).values_list('token', flat=True)
        
        if not tokens:
            return
        
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=data or {},
            tokens=list(tokens)
        )
        
        response = messaging.send_multicast(message)
        return response

# Utilisation
from django.db.models.signals import post_save

@receiver(post_save, sender=Alert)
def notify_alert_created(sender, instance, created, **kwargs):
    if created:
        NotificationService.send_push(
            user=instance.clinic.manager,
            title='⚠️ Rapport Manquant',
            body=f'Rapport du {instance.alert_date} non soumis',
            data={'alert_id': str(instance.id)}
        )
```

**Frontend (React PWA):**
```typescript
// Service Worker
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.notification.title, {
      body: data.notification.body,
      icon: '/logo192.png',
      badge: '/badge.png',
      tag: data.data.alert_id,
      requireInteraction: true
    })
  );
});

// React component
const usePushNotifications = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then(async (registration) => {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY
        });
        
        // Envoyer token au backend
        await api.post('/api/device-tokens/', {
          token: JSON.stringify(subscription),
          device_type: 'web'
        });
      });
    }
  }, []);
};
```

---

#### 10. Mode Sombre ✅
**Frontend (Material-UI):**
```typescript
// Context
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export const ColorModeProvider: React.FC = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme', newMode);
          return newMode;
        });
      }
    }),
    []
  );
  
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Palette claire
                primary: { main: '#1976d2' },
                background: { default: '#fafafa', paper: '#fff' }
              }
            : {
                // Palette sombre
                primary: { main: '#90caf9' },
                background: { default: '#121212', paper: '#1e1e1e' }
              })
        }
      }),
    [mode]
  );
  
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Bouton toggle
const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  
  return (
    <IconButton onClick={colorMode.toggleColorMode} color="inherit">
      {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
```

---

#### 11. Alertes Celery + WhatsApp ✅
**Configuration Celery:**
```python
# celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('vidmed')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Découvrir tasks automatiquement
app.autodiscover_tasks()

# Schedule périodique
app.conf.beat_schedule = {
    'check-missing-reports-daily': {
        'task': 'core.tasks.check_missing_reports',
        'schedule': crontab(hour=20, minute=0),  # 20h tous les jours
    },
    'send-weekly-summary': {
        'task': 'core.tasks.send_weekly_summary',
        'schedule': crontab(day_of_week=1, hour=9, minute=0),  # Lundi 9h
    }
}

# settings.py
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Port-au-Prince'
```

**Tasks:**
```python
# core/tasks.py
from celery import shared_task
from datetime import date, timedelta
from .models import Clinic, DailyReport, Alert, ClinicOffDay
from .services import WhatsAppService

@shared_task
def check_missing_reports():
    """
    Vérifier rapports manquants et créer alertes
    Exécuté tous les jours à 20h
    """
    today = date.today()
    clinics = Clinic.objects.filter(is_active=True)
    
    for clinic in clinics:
        # Vérifier si jour OFF
        is_off = ClinicOffDay.objects.filter(
            clinic=clinic,
            off_date=today
        ).exists()
        
        if is_off:
            continue
        
        # Vérifier si rapport existe
        report_exists = DailyReport.objects.filter(
            clinic=clinic,
            report_date=today
        ).exists()
        
        if not report_exists:
            # Créer alerte
            alert, created = Alert.objects.get_or_create(
                clinic=clinic,
                alert_date=today,
                defaults={
                    'message': f'Rapport du {today} non soumis',
                    'is_resolved': False
                }
            )
            
            if created:
                # Envoyer notification WhatsApp
                if clinic.manager:
                    WhatsAppService.send_message(
                        to=clinic.manager.phone,
                        message=f"⚠️ Rappel: Le rapport du {today.strftime('%d/%m/%Y')} "
                                f"pour {clinic.name} n'a pas été soumis. "
                                f"Merci de l'entrer dans le système."
                    )
    
    return f"Checked {clinics.count()} clinics"


@shared_task
def send_weekly_summary(clinic_id=None):
    """
    Envoyer résumé hebdomadaire par WhatsApp
    Exécuté tous les lundis à 9h
    """
    from datetime import date, timedelta
    
    today = date.today()
    week_start = today - timedelta(days=7)
    
    if clinic_id:
        clinics = Clinic.objects.filter(id=clinic_id)
    else:
        clinics = Clinic.objects.filter(is_active=True)
    
    for clinic in clinics:
        # Calculer statistiques semaine
        from django.db.models import Sum
        
        # Vue matérialisée
        inflows = CashFlowView.objects.filter(
            clinic=clinic,
            transaction_date__gte=week_start,
            transaction_date__lt=today,
            flow_type='in'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        outflows = CashFlowView.objects.filter(
            clinic=clinic,
            transaction_date__gte=week_start,
            transaction_date__lt=today,
            flow_type='out'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        net = inflows - outflows
        
        # Message WhatsApp
        message = f"""
📊 *Résumé Hebdomadaire - {clinic.name}*
Période: {week_start.strftime('%d/%m')} au {today.strftime('%d/%m/%Y')}

📈 Entrées: {inflows:,.0f} HTG
📉 Sorties: {outflows:,.0f} HTG
━━━━━━━━━━━━━━━━━━
💰 Cash-Flow Net: {net:,.0f} HTG ({net/inflows*100:.1f}%)

{'✅ Excellent!' if net > 0 else '⚠️ Attention!'}
        """.strip()
        
        # Envoyer au manager ET superusers
        recipients = [clinic.manager] if clinic.manager else []
        recipients.extend(User.objects.filter(role__in=['superuser', 'grand_superuser']))
        
        for user in recipients:
            if user.phone:
                WhatsAppService.send_message(to=user.phone, message=message)
```

**Service WhatsApp (Twilio):**
```python
# core/services/whatsapp.py
from twilio.rest import Client
from django.conf import settings

class WhatsAppService:
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    from_number = settings.TWILIO_WHATSAPP_NUMBER  # 'whatsapp:+14155238886'
    
    @classmethod
    def send_message(cls, to: str, message: str):
        """
        Envoyer message WhatsApp
        
        Args:
            to: Numéro au format +509XXXXXXXX
            message: Texte du message
        """
        try:
            # Formater numéro
            if not to.startswith('whatsapp:'):
                to = f'whatsapp:{to}'
            
            message = cls.client.messages.create(
                body=message,
                from_=cls.from_number,
                to=to
            )
            
            return message.sid
        except Exception as e:
            # Logger l'erreur
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'WhatsApp error for {to}: {e}')
            return None
    
    @classmethod
    def send_template(cls, to: str, template_name: str, params: dict):
        """Envoyer template pré-approuvé Twilio"""
        # Templates pré-approuvés par WhatsApp
        templates = {
            'missing_report': "⚠️ Rappel: Le rapport du {{1}} pour {{2}} n'a pas été soumis.",
            'debt_reminder': "💰 Rappel: Dette de {{1}} HTG échue le {{2}}.",
        }
        
        message = templates[template_name].format(**params)
        return cls.send_message(to, message)
```

**Configuration:**
```python
# settings.py
TWILIO_ACCOUNT_SID = env('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = env('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = env('TWILIO_WHATSAPP_NUMBER', default='whatsapp:+14155238886')
```

---

#### 12. Balance Générale et Grand Livre ✅
**Mapping codes simples → codes légaux:**
```python
# core/models.py
class LegalAccountMapping(models.Model):
    """Mapping codes simples → plan comptable SYSCOHADA"""
    account_code = models.OneToOneField(AccountCode, on_delete=models.CASCADE)
    legal_code = models.CharField(max_length=10)  # Ex: "706100"
    legal_name = models.CharField(max_length=200)
    account_class = models.CharField(max_length=1, choices=[
        ('1', 'Comptes de capitaux'),
        ('2', 'Comptes d'immobilisations'),
        ('3', 'Comptes de stocks'),
        ('4', 'Comptes de tiers'),
        ('5', 'Comptes de trésorerie'),
        ('6', 'Comptes de charges'),
        ('7', 'Comptes de produits'),
    ])
    
    class Meta:
        db_table = 'legal_account_mapping'

# Données initiales
LEGAL_MAPPINGS = {
    'REV_CONSULTATION': ('706100', 'Ventes de prestations de services', '7'),
    'REV_PHARMACIE': ('701100', 'Ventes de marchandises', '7'),
    'REV_EXAMEN': ('706200', 'Prestations techniques', '7'),
    'ACH_MEDICAMENT': ('601100', 'Achats de marchandises', '6'),
    'SAL_MEDECIN': ('641100', 'Salaires bruts', '6'),
    'SAL_INFIRMIER': ('641100', 'Salaires bruts', '6'),
    'LOY_LOYER': ('622200', 'Locations immobilières', '6'),
    'ELE_ELECTRICITE': ('605200', 'Électricité', '6'),
    # ... etc
}
```

**API Balance Générale:**
```python
@api_view(['GET'])
def balance_generale(request):
    """
    Générer balance générale
    
    Params:
    - start_date, end_date
    - format: 'simple' ou 'legal'
    """
    start = request.GET.get('start_date')
    end = request.GET.get('end_date')
    format_type = request.GET.get('format', 'simple')
    
    # Agrégation par compte
    transactions = CashFlowView.objects.filter(
        transaction_date__gte=start,
        transaction_date__lte=end
    ).values(
        'account_code__code',
        'account_code__name'
    ).annotate(
        debit=Sum(Case(
            When(flow_type='out', then='amount'),
            default=0,
            output_field=DecimalField()
        )),
        credit=Sum(Case(
            When(flow_type='in', then='amount'),
            default=0,
            output_field=DecimalField()
        ))
    )
    
    if format_type == 'legal':
        # Mapper vers codes légaux
        legal_transactions = {}
        for trans in transactions:
            mapping = LegalAccountMapping.objects.get(
                account_code__code=trans['account_code__code']
            )
            legal_code = mapping.legal_code
            
            if legal_code not in legal_transactions:
                legal_transactions[legal_code] = {
                    'code': legal_code,
                    'name': mapping.legal_name,
                    'class': mapping.account_class,
                    'debit': 0,
                    'credit': 0
                }
            
            legal_transactions[legal_code]['debit'] += trans['debit']
            legal_transactions[legal_code]['credit'] += trans['credit']
        
        transactions = sorted(
            legal_transactions.values(),
            key=lambda x: x['code']
        )
    
    # Calculer soldes
    for trans in transactions:
        trans['solde'] = trans['debit'] - trans['credit']
        trans['solde_type'] = 'debiteur' if trans['solde'] > 0 else 'crediteur'
        trans['solde_abs'] = abs(trans['solde'])
    
    # Totaux
    total_debit = sum(t['debit'] for t in transactions)
    total_credit = sum(t['credit'] for t in transactions)
    
    return Response({
        'period': {'start': start, 'end': end},
        'format': format_type,
        'accounts': transactions,
        'totals': {
            'debit': total_debit,
            'credit': total_credit,
            'balanced': abs(total_debit - total_credit) < 0.01  # Tolérance 1 centime
        }
    })
```

**API Grand Livre:**
```python
@api_view(['GET'])
def grand_livre(request):
    """
    Grand livre d'un compte
    
    Params:
    - account_code: Code du compte
    - start_date, end_date
    """
    account_code = request.GET.get('account_code')
    start = request.GET.get('start_date')
    end = request.GET.get('end_date')
    
    transactions = CashFlowView.objects.filter(
        account_code__code=account_code,
        transaction_date__gte=start,
        transaction_date__lte=end
    ).select_related('account_code').order_by('transaction_date', 'id')
    
    # Calculer solde progressif
    solde = Decimal('0')
    result = []
    
    for trans in transactions:
        if trans.flow_type == 'in':
            solde += trans.amount
            result.append({
                'date': trans.transaction_date,
                'description': trans.description,
                'debit': 0,
                'credit': trans.amount,
                'solde': solde
            })
        else:
            solde -= trans.amount
            result.append({
                'date': trans.transaction_date,
                'description': trans.description,
                'debit': trans.amount,
                'credit': 0,
                'solde': solde
            })
    
    return Response({
        'account': {
            'code': account_code,
            'name': AccountCode.objects.get(code=account_code).name
        },
        'period': {'start': start, 'end': end},
        'transactions': result,
        'final_balance': solde
    })
```

---

## ⏱️ Estimation Temps Total

| Amélioration | Temps | Priorité |
|--------------|-------|----------|
| Vue matérialisée | 4h | 🔴 |
| Soft delete | 3h | 🔴 |
| Versioning (django-simple-history) | 2h | 🔴 |
| Validation montants | 2h | 🔴 |
| Pagination optimale | 2h | 🔴 |
| Cache Redis complet | 6h | 🔴 |
| Comparaison N vs N-1 | 4h | 🔴 |
| Filtres favoris | 3h | 🟡 |
| Notifications push | 6h | 🟡 |
| Mode sombre | 2h | 🟡 |
| Alertes Celery + WhatsApp | 12h | 🔴 |
| Balance + Grand livre | 8h | 🟡 |

**TOTAL: ~54 heures** de développement

---

## 🚀 Plan d'Exécution

### Semaine 1 (Backend Core)
**Jours 1-2:** Optimisations base (16h)
- Vue matérialisée
- Soft delete
- Versioning
- Validation montants
- Pagination

**Jours 3-4:** Cache et Performance (12h)
- Cache Redis complet
- Monitoring cache
- Invalidation intelligente

**Jour 5:** Comparaison périodes (4h)

### Semaine 2 (Features Avancées)
**Jours 1-2:** Alertes (12h)
- Celery + Redis
- Tâches périodiques
- WhatsApp Twilio

**Jour 3:** Filtres favoris + Notifications push (9h)

**Jour 4:** Balance + Grand livre (8h)

**Jour 5:** Mode sombre + Accessibilité (4h)

### Semaine 3 (Tests et Déploiement)
**Jours 1-3:** Tests complets (24h)
- Tests unitaires
- Tests intégration
- Tests E2E

**Jour 4:** GitHub + Documentation (8h)
- README complet
- CONTRIBUTING.md
- Docker
- CI/CD

**Jour 5:** Déploiement Render (8h)
- Configuration production
- Variables environnement
- Tests production

---

## 📂 Structure Finale

```
vidmed/
├── backend/
│   ├── core/
│   │   ├── models.py (avec SoftDeleteMixin, history)
│   │   ├── views.py (vue matérialisée proxy)
│   │   ├── tasks.py (Celery tasks)
│   │   ├── services/
│   │   │   ├── cache.py (CacheService optimal)
│   │   │   ├── whatsapp.py (WhatsAppService)
│   │   │   └── notifications.py (Push notifications)
│   │   └── management/commands/
│   │       ├── setup_accounts.py
│   │       └── create_materialized_view.py
│   ├── api/
│   │   ├── views.py (avec cache, pagination)
│   │   ├── serializers.py
│   │   └── permissions.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── celery.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── NotificationHandler.tsx
│   │   │   ├── manager/
│   │   │   ├── superuser/
│   │   │   │   ├── CashFlowComparison.tsx (N vs N-1)
│   │   │   │   └── FilterFavorites.tsx
│   │   │   └── charts/
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   └── services/
│   │       └── cache.ts (cache côté client)
│   ├── public/
│   │   ├── sw.js (Service Worker)
│   │   └── firebase-messaging-sw.js
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── backend-tests.yml
│       └── frontend-tests.yml
│
├── docker-compose.yml
├── README.md
└── DEPLOYMENT.md
```

---

## ✅ Prêt à Implémenter

**Je vais maintenant créer TOUS les fichiers avec toutes ces optimisations.**

Voulez-vous que je commence par:
1. **Backend complet** (models, views, tasks, cache)
2. **Frontend complet** (components, contexts, PWA)
3. **Configuration** (Docker, GitHub, Render)

Ou préférez-vous que je fasse **TOUT D'UN COUP** et vous livre un système complet prêt à déployer?

**Répondez simplement: "Tout d'un coup"** et je commence! 🚀
