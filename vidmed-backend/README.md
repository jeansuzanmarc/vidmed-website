# VIDMED Backend v2.0

Backend Django pour le système de gestion de flux de trésorerie VIDMED.

## 🚀 Fonctionnalités

- **Architecture Django 5.0 + MySQL 8.0 + Redis + Celery**
- **Vue matérialisée** pour les flux de trésorerie (remplace table redondante)
- **Soft delete** avec possibilité de restauration
- **Versioning complet** avec django-simple-history
- **Validation automatique** des montants aberrants
- **Cache Redis optimal** avec TTL différenciés
- **Alertes automatiques** (rapports manquants, dettes en retard) à 20h00
- **Notifications WhatsApp** via Twilio
- **Notifications push** via Firebase Cloud Messaging
- **Comparaison de périodes** N vs N-1
- **Comptabilité légale** (Balance générale, Grand livre) avec mapping SYSCOHADA

## 📋 Prérequis

- Python 3.11+
- MySQL 8.0+
- Redis 7+
- Compte Twilio (pour WhatsApp)
- Projet Firebase (pour push notifications)

## 🛠️ Installation locale

### 1. Cloner et créer environnement virtuel

```bash
cd vidmed-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à partir de `.env.example`:

```bash
cp .env.example .env
```

Modifier `.env` avec vos valeurs:

```env
SECRET_KEY=votre-cle-secrete-ici
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=vidmed
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=3306

REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0

TWILIO_ACCOUNT_SID=votre_twilio_sid
TWILIO_AUTH_TOKEN=votre_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Créer la base de données

```bash
mysql -u root -p
CREATE DATABASE vidmed CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 5. Exécuter les migrations

```bash
python manage.py migrate
```

### 6. Créer un superuser

```bash
python manage.py createsuperuser
```

### 7. Lancer le serveur

```bash
python manage.py runserver
```

Le backend sera accessible sur `http://localhost:8000`

### 8. Lancer Celery (dans un autre terminal)

```bash
# Worker
celery -A vidmed_project worker -l info

# Beat (tâches périodiques)
celery -A vidmed_project beat -l info
```

## 🐳 Installation avec Docker

### 1. Créer le fichier .env

```bash
cp .env.example .env
# Modifier .env avec vos valeurs
```

### 2. Lancer avec Docker Compose

```bash
docker-compose up -d
```

Cela démarre:
- MySQL (port 3306)
- Redis (port 6379)
- Backend Django (port 8000)
- Celery Worker
- Celery Beat

### 3. Vérifier les logs

```bash
docker-compose logs -f backend
```

### 4. Accéder au backend

Le backend sera accessible sur `http://localhost:8000`

## 📊 Structure du projet

```
vidmed-backend/
├── vidmed_project/
│   ├── __init__.py
│   ├── settings.py          # Configuration Django
│   ├── urls.py              # URLs principales
│   ├── wsgi.py
│   ├── celery.py            # Configuration Celery
│   ├── core/                # App principale
│   │   ├── models.py        # 13 modèles avec SoftDelete et versioning
│   │   ├── serializers.py   # Serializers DRF
│   │   ├── permissions.py   # Permissions par rôle
│   │   ├── signals.py       # Signaux Django (cache invalidation)
│   │   ├── tasks.py         # Tâches Celery (alertes)
│   │   ├── views/
│   │   │   ├── auth.py      # Login/Logout
│   │   │   ├── crud.py      # ViewSets CRUD
│   │   │   ├── dashboard.py # Dashboard & cash flow
│   │   │   └── reports.py   # Comparaison & comptabilité
│   │   ├── migrations/
│   │   │   └── 0002_create_cash_flow_view.py  # Vue matérialisée
│   │   └── mixins.py        # SoftDeleteMixin
│   ├── services/
│   │   ├── cache_service.py       # Service cache Redis
│   │   ├── whatsapp_service.py    # Service WhatsApp
│   │   └── notification_service.py # Service notifications push
│   └── utils/
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── .env.example
└── README.md
```

## 🔐 Authentification

Le système utilise **JWT (JSON Web Tokens)** avec refresh tokens.

### Endpoints d'authentification

**Login:**
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Réponse:**
```json
{
  "access": "eyJ0eXAiOiJKV1...",
  "refresh": "eyJ0eXAiOiJKV1...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "grand_superuser",
    ...
  }
}
```

**Utiliser le token:**
```http
GET /api/dashboard/1/
Authorization: Bearer eyJ0eXAiOiJKV1...
```

**Refresh token:**
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1..."
}
```

## 📡 API Endpoints

### CRUD Endpoints

| Endpoint | Méthode | Permission | Description |
|----------|---------|------------|-------------|
| `/api/users/` | GET, POST | Grand Superuser | Gérer utilisateurs |
| `/api/clinics/` | GET, POST | Grand Superuser | Gérer cliniques |
| `/api/account-codes/` | GET | Tous | Lire codes de compte |
| `/api/account-codes/` | POST, PUT, DELETE | Grand Superuser | Modifier codes |
| `/api/daily-reports/` | GET, POST | Manager | Rapports journaliers |
| `/api/expenses/` | GET, POST | Manager, Superuser | Dépenses |
| `/api/patient-debts/` | GET, POST | Manager | Dettes patients |
| `/api/company-debts/` | GET, POST | Superuser | Dettes entreprise |
| `/api/owner-transactions/` | GET, POST | Superuser | Apports/retraits |
| `/api/alerts/` | GET | Tous | Alertes |

### Dashboard & Statistics

| Endpoint | Description |
|----------|-------------|
| `/api/dashboard/{clinic_id}/` | Statistiques dashboard (cache 5 min) |
| `/api/cash-flow/{clinic_id}/` | Flux de trésorerie (cache 10 min) |
| `/api/comparison/{clinic_id}/` | Comparaison périodes N vs N-1 |

### Comptabilité légale

| Endpoint | Permission | Description |
|----------|------------|-------------|
| `/api/balance-generale/{clinic_id}/` | Superuser | Balance générale |
| `/api/grand-livre/{clinic_id}/` | Superuser | Grand livre détaillé |

### Audit

| Endpoint | Description |
|----------|-------------|
| `/api/history/{model_name}/{object_id}/` | Historique modifications (django-simple-history) |

## ⏰ Tâches automatiques (Celery)

Les tâches suivantes s'exécutent automatiquement:

| Tâche | Fréquence | Description |
|-------|-----------|-------------|
| `check_missing_reports` | Tous les jours à 20h00 | Vérifier rapports journaliers manquants → Alerte WhatsApp |
| `check_unpaid_debts` | Lundi 9h00 | Vérifier dettes en retard → Alerte WhatsApp |
| `generate_monthly_summary` | 1er du mois à 6h00 | Résumé mensuel → WhatsApp aux Superusers |
| `clear_old_cache` | 1er du mois à 2h00 | Nettoyer cache Redis |

## 🎯 Roles et permissions

### 3 rôles hiérarchiques

1. **Manager** (role='manager')
   - Soumettre rapports journaliers
   - Gérer dépenses de sa clinique
   - Gérer dettes patients
   - Voir dashboard de sa clinique

2. **Superuser** (role='superuser')
   - Tout ce que Manager peut faire
   - Gérer dettes entreprise
   - Gérer transactions propriétaire (apports/retraits)
   - Voir balance générale et grand livre
   - Accéder à toutes les cliniques

3. **Grand Superuser** (role='grand_superuser')
   - Tout ce que Superuser peut faire
   - Créer/modifier utilisateurs
   - Créer/modifier codes de compte
   - Voir historique de modifications
   - Gérer cliniques

## 💾 Cache Redis

Le système utilise des TTL (Time To Live) optimisés par type de données:

| Type de données | TTL | Clé de cache |
|----------------|-----|--------------|
| Dashboard | 5 min | `dashboard:{clinic_id}` |
| Codes de compte | 1 heure | `account_codes:*` |
| Statistiques | 10 min | `stats:{clinic_id}` |
| Rapports mensuels | 30 min | `monthly_summary:{clinic_id}` |
| Filtres sauvegardés | 1 heure | `filters:{user_id}` |

Le cache est automatiquement invalidé via des **signaux Django** lors de:
- Création/modification de rapports journaliers
- Création/modification de dépenses
- Paiement de dettes

## 📱 Notifications

### WhatsApp (Twilio)

Configuration dans `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Types de messages:
- ⚠️ Rapport journalier manquant
- ⚠️ Dette patient en retard
- ⚠️ Dette entreprise en retard
- ⚠️ Trésorerie faible
- 📊 Résumé mensuel

### Push Notifications (Firebase)

1. Créer un projet Firebase
2. Télécharger `firebase-credentials.json`
3. Placer dans le dossier backend
4. Configurer dans `.env`:

```env
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

Les utilisateurs reçoivent des notifications push pour:
- Rapport manquant
- Dette en retard
- Trésorerie faible

## 🔄 Vue matérialisée Cash Flow

Au lieu d'une table `CashFlowTransaction` redondante, le système utilise une **vue SQL** qui regroupe les données de toutes les sources:

- Revenus des rapports journaliers (6 catégories)
- Dépenses
- Paiements de dettes patients (entrée)
- Paiements de dettes entreprise (sortie)
- Transactions propriétaire (apports/retraits)

Avantages:
- ✅ Pas de duplication de données
- ✅ Toujours à jour (pas de synchronisation)
- ✅ Performance optimale avec index

## 🧪 Tests

```bash
# Lancer les tests
python manage.py test

# Avec coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## 📦 Déploiement sur Render

Voir le fichier `DEPLOYMENT.md` pour le guide complet de déploiement gratuit sur Render.

## 📝 Licence

Propriétaire - VIDMED © 2026

## 🤝 Support

Pour toute question ou problème:
- Email: support@vidmed.com
- Documentation complète: `/Rapport/`

---

**Développé avec ❤️ pour optimiser la gestion des cliniques en Haïti**
