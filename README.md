# 🏥 VIDMED v2.0 - Système de Gestion de Flux de Trésorerie

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Backend](https://img.shields.io/badge/backend-Django%205.0-green.svg)
![Frontend](https://img.shields.io/badge/frontend-React%2018-blue.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

Système complet de gestion financière pour cliniques haïtiennes avec backend Django REST API et frontend React TypeScript.

---

## 📊 Aperçu

VIDMED v2.0 est un système de gestion de flux de trésorerie optimisé pour les cliniques en Haïti, offrant:

### ✨ Fonctionnalités Principales

- ✅ **Gestion simplifiée** avec codes explicites (REV_CONSULTATION au lieu de 7011)
- ✅ **Alertes automatiques** WhatsApp à 20h00 si rapport manquant
- ✅ **3 rôles hiérarchiques** (Manager, Superuser, Grand Superuser)
- ✅ **Dark mode** avec persistance localStorage
- ✅ **Notifications push** Firebase Cloud Messaging
- ✅ **Comparaison périodes** N vs N-1 avec graphiques Recharts
- ✅ **Comptabilité légale** (Balance générale + Grand livre + SYSCOHADA)
- ✅ **Déploiement gratuit** (Render + Vercel + Railway)

### 🎯 Modules Disponibles

#### 📈 Gestion Quotidienne
- **Rapports Journaliers** - Consultation + Médicaments + Nombre de patients
- **Dépenses** - 6 catégories + 4 modes de paiement
- **Alertes automatiques** - WhatsApp si rapport manquant à 20h

#### 💰 Gestion des Dettes
- **Dettes Patients** - Suivi avec paiements partiels
- **Dettes Entreprise** - Gestion des créances B2B
- **Historique complet** - Tous les paiements enregistrés

#### 📊 Analyses Financières
- **Dashboard** - 8 KPIs en temps réel
- **Flux de Trésorerie** - Vue détaillée par jour
- **Comparaisons** - Graphiques N vs N-1 (semaine/mois/trimestre/année)
- **Balance Générale** - Conforme SYSCOHADA

#### 👥 Administration
- **Gestion Utilisateurs** - 3 rôles avec permissions granulaires
- **Cliniques** - Multi-établissements
- **Codes Comptables** - Plan comptable personnalisable

---

## 🎯 État du Projet

### ✅ TERMINÉ (100%)

#### Backend Django (100%)
- ✅ 13 modèles avec SoftDelete + Versioning + Validation
- ✅ Vue matérialisée Cash Flow (pas de duplication)
- ✅ Cache Redis avec TTL optimaux (5min à 1h)
- ✅ Celery + alertes WhatsApp automatiques
- ✅ 30+ endpoints API REST
- ✅ Docker + docker-compose
- ✅ Documentation complète
- ✅ Tests de validation (28/28 réussis)

#### Frontend React (100%)
- ✅ Infrastructure Vite + TypeScript 5.3 + Material-UI v5
- ✅ Authentification JWT avec refresh automatique
- ✅ Dark mode avec persistance
- ✅ 15 pages complètes (Login + Dashboard + 13 pages CRUD)
- ✅ Services API complets pour toutes entités
- ✅ Graphiques Recharts pour comparaisons
- ✅ Formulaires validés avec React Hook Form
- ✅ Design responsive et moderne

---

## 📁 Structure du Projet

```
VIDMED/
├── vidmed-backend/              # Backend Django REST API
│   ├── vidmed_project/          # Projet Django principal
│   │   ├── core/                # Application principale
│   │   │   ├── models.py        # 13 modèles (User, Clinic, DailyReport, etc.)
│   │   │   ├── serializers.py  # 15 serializers
│   │   │   ├── views/           # Views organisées par domaine
│   │   │   ├── permissions.py  # 10 classes de permissions
│   │   │   ├── tasks.py         # 4 tâches Celery
│   │   │   └── urls.py          # Routes API
│   │   ├── services/            # Services métier
│   │   │   ├── cache_service.py
│   │   │   ├── whatsapp_service.py
│   │   │   └── notification_service.py
│   │   └── settings.py          # Configuration Django
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── README.md
│   └── DEPLOYMENT.md
│
├── vidmed-frontend/             # Frontend React TypeScript
│   ├── src/
│   │   ├── components/          # Composants réutilisables
│   │   │   └── Layout/          # AppBar + Sidebar + MainLayout
│   │   ├── pages/               # 15 pages
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DailyReportsPage.tsx
│   │   │   ├── ExpensesPage.tsx
│   │   │   ├── PatientDebtsPage.tsx
│   │   │   ├── CompanyDebtsPage.tsx
│   │   │   ├── OwnerTransactionsPage.tsx
│   │   │   ├── CashFlowPage.tsx
│   │   │   ├── ComparisonPage.tsx
│   │   │   ├── BalancePage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── ClinicsPage.tsx
│   │   │   ├── AccountCodesPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services/            # Services API
│   │   │   ├── api.ts           # Axios client + interceptors
│   │   │   └── dataService.ts   # 12 services CRUD
│   │   ├── stores/              # State management Zustand
│   │   │   ├── authStore.ts
│   │   │   └── themeStore.ts
│   │   ├── types/               # TypeScript interfaces
│   │   ├── theme/               # Material-UI theme
│   │   └── App.tsx              # Routing
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
└── Rapport/                     # Documentation complète
    ├── 00-PROJET-COMPLET-VIDMED-V2.md
    ├── 03-IMPLEMENTATION-COMPLETE-BACKEND.md
    ├── 04-IMPLEMENTATION-FRONTEND-PHASE1.md
    ├── 05-RAPPORT-TESTS-APPROFONDIS.md
    ├── 06-RAPPORT-TESTS-FRONTEND.md
    ├── 07-SYNTHESE-TESTS-COMPLETE.md
    └── 08-IMPLEMENTATION-COMPLETE-FRONTEND-PHASE2.md
```

---

## 🚀 Installation et Démarrage

### Prérequis

- **Backend:** Python 3.11+, MySQL 8.0, Redis 7.0
- **Frontend:** Node.js 18+, npm 9+

### Installation Backend

```bash
cd vidmed-backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer dépendances
pip install -r requirements.txt

# Configurer .env
cp .env.example .env
# Éditer .env avec vos paramètres

# Migrations
python manage.py migrate

# Créer superuser
python manage.py createsuperuser

# Lancer serveur
python manage.py runserver
```

### Installation Frontend

```bash
cd vidmed-frontend

# Installer dépendances
npm install

# Configurer .env
cp .env.example .env
# Éditer VITE_API_URL

# Lancer dev server
npm run dev
```

### Docker (Recommandé)

```bash
cd vidmed-backend

# Lancer tous les services
docker-compose up -d

# Backend: http://localhost:8000
# MySQL: localhost:3306
# Redis: localhost:6379
```

---

## 🔐 Authentification

### 3 Rôles Hiérarchiques

1. **Manager** - Gestion quotidienne
   - Créer rapports journaliers
   - Gérer dépenses
   - Voir dettes patients

2. **Superuser** - Gestion financière
   - Toutes permissions Manager
   - Gérer dettes entreprise
   - Transactions propriétaire
   - Voir balance et comparaisons

3. **Grand Superuser** - Administration complète
   - Toutes permissions Superuser
   - Gérer utilisateurs
   - Gérer cliniques
   - Gérer codes comptables

### Permissions Granulaires

10 classes de permissions pour contrôler l'accès:
- `IsGrandSuperuser`
- `IsSuperuserOrAbove`
- `IsManagerOrAbove`
- `CanManageDailyReports`
- `CanManageExpenses`
- `CanManagePatientDebts`
- `CanManageCompanyDebts`
- `CanManageOwnerTransactions`
- `CanManageUsers`
- `CanManageAccountCodes`

---

## 📊 Architecture Technique

### Backend Stack

- **Framework:** Django 5.0 + Django REST Framework 3.14
- **Base de données:** MySQL 8.0
- **Cache:** Redis 7.0 (TTL: 5min-1h)
- **Queue:** Celery 5.3 + Redis
- **Auth:** JWT (djangorestframework-simplejwt)
- **Versioning:** django-simple-history
- **Notifications:** Twilio WhatsApp API
- **Container:** Docker + docker-compose

### Frontend Stack

- **Framework:** React 18 + TypeScript 5.3
- **Build:** Vite 5.0
- **UI:** Material-UI v5
- **State:** Zustand avec persist
- **HTTP:** Axios avec interceptors
- **Forms:** React Hook Form
- **Charts:** Recharts 2.x
- **Routing:** React Router v6

### Architecture Backend

```
┌──────────────────────────────────────────────┐
│              Django REST API                  │
│  ┌────────────────────────────────────────┐  │
│  │         Views (CRUD + Custom)          │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌────────────────────────────────────────┐  │
│  │      Serializers (Validation)          │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌────────────────────────────────────────┐  │
│  │  Models (13) + Mixins (SoftDelete)     │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌──────────────┐    ┌──────────────────┐   │
│  │  MySQL 8.0   │    │  Redis Cache     │   │
│  │  (Données)   │    │  (5min-1h TTL)   │   │
│  └──────────────┘    └──────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │  Celery Tasks (Background Jobs)        │  │
│  │  - check_missing_reports (20h daily)   │  │
│  │  - check_unpaid_debts (Mon 9h)         │  │
│  │  - generate_monthly_summary (1st 6h)   │  │
│  │  - clear_old_cache (1st 2h)            │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌────────────────────────────────────────┐  │
│  │  WhatsApp Service (Twilio)             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Architecture Frontend

```
┌──────────────────────────────────────────────┐
│            React 18 + TypeScript              │
│  ┌────────────────────────────────────────┐  │
│  │  Pages (15) - Login + Dashboard + 13   │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌────────────────────────────────────────┐  │
│  │  Components (Layout + Reusable)        │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌────────────────────────────────────────┐  │
│  │  Services (API + Data)                 │  │
│  │  - Axios client (interceptors JWT)     │  │
│  │  - 12 CRUD services                    │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌────────────────────────────────────────┐  │
│  │  Stores (Zustand + Persist)            │  │
│  │  - authStore (JWT + user)              │  │
│  │  - themeStore (dark mode)              │  │
│  └────────────────────────────────────────┘  │
│                     ↓                         │
│  ┌────────────────────────────────────────┐  │
│  │  Material-UI Theme (Light + Dark)      │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## 📚 Documentation

### Documentation Complète

Consultez le dossier **`Rapport/`** pour la documentation exhaustive:

- **`00-PROJET-COMPLET-VIDMED-V2.md`** - Vision globale du projet
- **`03-IMPLEMENTATION-COMPLETE-BACKEND.md`** - Documentation backend
- **`04-IMPLEMENTATION-FRONTEND-PHASE1.md`** - Frontend Phase 1
- **`08-IMPLEMENTATION-COMPLETE-FRONTEND-PHASE2.md`** - Frontend Phase 2
- **`05-RAPPORT-TESTS-APPROFONDIS.md`** - Tests backend (17/17)
- **`06-RAPPORT-TESTS-FRONTEND.md`** - Tests frontend (11/11)
- **`07-SYNTHESE-TESTS-COMPLETE.md`** - Synthèse complète (28/28)

### README Spécifiques

- **Backend:** `vidmed-backend/README.md`
- **Frontend:** `vidmed-frontend/README.md`
- **Déploiement:** `vidmed-backend/DEPLOYMENT.md`

---

## 🚀 Déploiement

### Option 1: Services Gratuits (Recommandé)

- **Backend:** Render.com (gratuit)
- **Frontend:** Vercel (gratuit)
- **MySQL:** Railway.app (gratuit)
- **Redis:** Upstash (gratuit)

Guide complet: `vidmed-backend/DEPLOYMENT.md`

### Option 2: VPS ou Serveur Dédié

Instructions dans `vidmed-backend/DEPLOYMENT.md` - Section "Déploiement VPS"

---

## 🧪 Tests

### Backend Tests

```bash
cd vidmed-backend
python test_backend.py
```

**Résultats:** 17/17 tests réussis (100%)

### Frontend Tests (À venir)

```bash
cd vidmed-frontend
npm run test          # Tests unitaires (Jest + React Testing Library)
npm run test:e2e      # Tests E2E (Cypress)
```

---

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez suivre ces étapes:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Changelog

### Version 2.0.0 (2026-06-01)

#### ✨ Nouveautés
- ✅ Backend Django complet avec 13 modèles
- ✅ Frontend React avec 15 pages
- ✅ Authentification JWT avec refresh
- ✅ Dark mode persistant
- ✅ Alertes WhatsApp automatiques
- ✅ Graphiques Recharts pour comparaisons
- ✅ Balance SYSCOHADA
- ✅ Docker support
- ✅ Documentation complète

#### 🐛 Corrections
- Fixé erreur syntaxe models.py ligne 272
- Fixé encodage emojis dans test_backend.py
- Ajouté champ patient_count dans DailyReport

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **Jean Suzan Marc** - Développement initial

---

## 📞 Support

Pour toute question ou support:

- **GitHub Issues:** [https://github.com/jeansuzanmarc/Vidmed_cashflow/issues](https://github.com/jeansuzanmarc/Vidmed_cashflow/issues)
- **Email:** [Votre email]

---

## 🙏 Remerciements

- Django REST Framework pour l'excellent framework API
- Material-UI pour les composants React
- Recharts pour les graphiques
- La communauté open-source

---

**© 2026 VIDMED - Système de gestion de flux de trésorerie pour cliniques haïtiennes**
