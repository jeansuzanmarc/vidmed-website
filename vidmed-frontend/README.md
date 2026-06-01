# VIDMED Frontend v2.0

Interface React TypeScript avec Material-UI pour le système de gestion VIDMED.

## 🚀 Fonctionnalités

- **React 18** + **TypeScript**
- **Material-UI v5** avec thème personnalisé
- **Mode sombre** avec persistance
- **Authentification JWT** avec refresh automatique
- **State management** avec Zustand
- **Notifications push** Firebase Cloud Messaging
- **Graphiques** avec Recharts
- **Formulaires** avec React Hook Form
- **Responsive** pour mobile/tablette/desktop

## 📋 Prérequis

- Node.js 18+ et npm/yarn
- Backend VIDMED en cours d'exécution
- Compte Firebase (pour notifications push)

## 🛠️ Installation

### 1. Cloner et installer

```bash
cd vidmed-frontend
npm install
# ou
yarn install
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à partir de `.env.example`:

```bash
cp .env.example .env
```

Modifier `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api

# Firebase (pour notifications push)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### 3. Lancer le serveur de développement

```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur `http://localhost:3000`

## 📊 Structure du projet

```
vidmed-frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   └── Layout/          # Layout principal
│   │       ├── AppBar.tsx
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   ├── pages/               # Pages principales
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── services/            # Services API
│   │   ├── api.ts           # Client Axios avec intercepteurs
│   │   ├── authService.ts
│   │   ├── dashboardService.ts
│   │   ├── dataService.ts
│   │   └── firebaseService.ts
│   ├── stores/              # State management Zustand
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   ├── types/               # Types TypeScript
│   │   └── index.ts
│   ├── utils/               # Utilitaires
│   │   └── format.ts
│   ├── hooks/               # Custom hooks
│   │   └── useNotifications.ts
│   ├── theme/               # Thème Material-UI
│   │   └── index.tsx
│   ├── App.tsx              # Routing principal
│   ├── main.tsx             # Point d'entrée
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Thème et Dark Mode

Le système de thème est géré par Zustand avec persistance dans localStorage:

```typescript
import { useThemeStore } from '@/stores/themeStore';

const mode = useThemeStore((state) => state.mode);
const toggleTheme = useThemeStore((state) => state.toggleTheme);
```

Palettes définies:
- **Light mode**: Bleu primary, violet secondary
- **Dark mode**: Palette adaptée avec contrastes optimisés

## 🔐 Authentification

L'authentification utilise JWT avec refresh automatique:

```typescript
import { useAuthStore } from '@/stores/authStore';

const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const logout = useAuthStore((state) => state.logout);
```

Le service API intercepte automatiquement les erreurs 401 et refresh le token.

## 📱 Notifications Push

Configuration Firebase dans `.env`, puis:

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { showNotification } = useNotifications();

// Afficher une notification
showNotification('Message envoyé!', 'success');
```

Types de notifications:
- `default` - Gris
- `success` - Vert
- `warning` - Orange
- `error` - Rouge
- `info` - Bleu

## 🔄 Services API

Tous les services retournent des Promises:

```typescript
import { dailyReportService } from '@/services/dataService';

// Liste paginée
const reports = await dailyReportService.list({ clinic: 1 });

// Créer
const newReport = await dailyReportService.create(data);

// Modifier
await dailyReportService.update(id, data);

// Supprimer
await dailyReportService.delete(id);
```

## 📊 Pages disponibles

### ✅ Implémentées

- **Login** - Page de connexion avec validation
- **Dashboard** - Statistiques principales avec 8 cartes

### 🚧 À implémenter (TODO dans App.tsx)

- **DailyReports** - Rapports journaliers avec formulaire
- **Expenses** - Liste et création dépenses
- **PatientDebts** - Gestion dettes patients
- **CompanyDebts** - Gestion dettes entreprise
- **OwnerTransactions** - Apports/retraits propriétaire
- **CashFlow** - Flux de trésorerie détaillé
- **Comparison** - Comparaison périodes avec graphiques
- **Balance** - Balance générale
- **Alerts** - Liste des alertes
- **Users** - Gestion utilisateurs (Grand Superuser)
- **Clinics** - Gestion cliniques (Grand Superuser)
- **AccountCodes** - Gestion codes (Grand Superuser)
- **Profile** - Profil utilisateur

## 🎯 Permissions par rôle

Le système gère 3 rôles:

### Manager
- Dashboard
- Rapports journaliers (créer/modifier les siens)
- Dépenses de sa clinique
- Dettes patients

### Superuser
- Tout ce que Manager peut faire
- Dettes entreprise
- Transactions propriétaire
- Comparaison périodes
- Balance générale

### Grand Superuser
- Tout ce que Superuser peut faire
- Gestion utilisateurs
- Gestion cliniques
- Gestion codes de compte

Le Sidebar s'adapte automatiquement selon le rôle.

## 🛠️ Build pour production

```bash
npm run build
# ou
yarn build
```

Les fichiers de production seront dans `dist/`.

## 🚀 Déploiement sur Vercel (GRATUIT)

### 1. Préparer le projet

```bash
# S'assurer que tout est commité
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Créer compte Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Importer le dépôt `vidmed-frontend`

### 3. Configuration Vercel

**Build Settings:**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**

Ajouter toutes les variables de `.env`:

```
VITE_API_BASE_URL=https://vidmed-backend.onrender.com/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

### 4. Déployer

Cliquer "Deploy" - Vercel va:
1. Cloner votre repo
2. Installer les dépendances
3. Build le projet
4. Déployer

⏱️ Durée: 2-3 minutes

### 5. URL finale

Votre application sera accessible sur:
```
https://vidmed-frontend.vercel.app
```

Vous pouvez configurer un domaine personnalisé gratuitement.

## 🔒 CORS Configuration

N'oubliez pas de mettre à jour `CORS_ALLOWED_ORIGINS` dans le backend:

```env
# Backend .env
CORS_ALLOWED_ORIGINS=https://vidmed-frontend.vercel.app
```

## 📝 TODO - Pages à créer

Les pages suivantes doivent encore être créées (même structure que Dashboard.tsx):

1. **DailyReportsPage** - Formulaire avec validation:
   - Date (obligatoire)
   - Nombre de patients (obligatoire)
   - 6 champs revenus
   - Notes (optionnel)
   - Validation: max patients/jour, montants

2. **ExpensesPage** - Liste + formulaire:
   - Sélection AccountCode (obligatoire)
   - Date
   - Montant
   - Description

3. **PatientDebtsPage** - Gestion dettes:
   - Liste des dettes
   - Formulaire nouvelle dette
   - Modal paiement
   - Badge "En retard"

4. **CashFlowPage** - Tableau filtrable:
   - Date range picker
   - Filtre IN/OUT
   - Filtre par AccountCode
   - Export Excel (optionnel)

5. **ComparisonPage** - Graphiques comparaison:
   - 2 date pickers (période 1 et 2)
   - Graphiques Recharts (barres, lignes)
   - % de variation
   - Analyse textuelle

## 🧪 Tests

```bash
npm run lint
# ou
yarn lint
```

## 📄 Licence

Propriétaire - VIDMED © 2026

---

**Développé avec ⚡ + React + TypeScript + Material-UI**
