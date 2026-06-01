#!/bin/bash
set -e

echo "Waiting for MySQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "MySQL started"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Creating superuser if doesn't exist..."
python manage.py shell << END
from core.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@vidmed.com', 'admin123', role='grand_superuser')
    print('Superuser created')
else:
    print('Superuser already exists')
END

echo "Starting server..."
exec "$@"
