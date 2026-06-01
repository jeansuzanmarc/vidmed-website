import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vidmed_project.settings')

app = Celery('vidmed_project')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Configuration des tâches périodiques
app.conf.beat_schedule = {
    'check-missing-reports-daily': {
        'task': 'core.tasks.check_missing_reports',
        'schedule': crontab(hour=20, minute=0),  # 20h00 tous les jours
    },
    'check-unpaid-debts-weekly': {
        'task': 'core.tasks.check_unpaid_debts',
        'schedule': crontab(day_of_week=1, hour=9, minute=0),  # Lundi 9h00
    },
    'generate-monthly-summary': {
        'task': 'core.tasks.generate_monthly_summary',
        'schedule': crontab(day_of_month=1, hour=6, minute=0),  # 1er du mois à 6h00
    },
    'clear-cache-monthly': {
        'task': 'core.tasks.clear_old_cache',
        'schedule': crontab(day_of_month=1, hour=2, minute=0),  # 1er du mois à 2h00
    },
}

app.conf.timezone = 'America/Port-au-Prince'

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
