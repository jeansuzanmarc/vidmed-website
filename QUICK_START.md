# 🚀 VIDMED v2.0 - Démarrage Rapide

Guide pour démarrer VIDMED en quelques minutes avec Docker.

---

## ✅ Prérequis

- **Docker Desktop** installé (Windows/Mac/Linux)
- **Git** installé
- **Node.js 18+** et **npm** (pour le frontend)

---

## 📦 Installation Complète (5 minutes)

### 1. Cloner le Repository

```bash
git clone https://github.com/jeansuzanmarc/Vidmed_cashflow.git
cd Vidmed_cashflow
```

### 2. Configurer le Backend (avec Docker)

```bash
cd vidmed-backend

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env si nécessaire (optionnel pour dev local)
# Les valeurs par défaut fonctionnent avec Docker

# Démarrer tous les services (MySQL + Redis + Django)
docker-compose up -d

# Attendre 30 secondes que MySQL démarre...
# Puis vérifier les logs
docker-compose logs -f web
```

**Services démarrés:**
- MySQL: `localhost:3306`
- Redis: `localhost:6379`
- Django API: `http://localhost:8000`

### 3. Créer le Superuser

**Option A - Avec Docker (Recommandé):**

```bash
# Depuis vidmed-backend/
docker-compose exec web python manage.py createsuperuser

# Ou avec le script interactif:
docker-compose exec web python create_superuser.py
```

**Option B - Script Python Direct:**

```bash
# Depuis vidmed-backend/
python create_superuser.py
```

**Credentials suggérés:**
- Username: `admin`
- Email: `admin@vidmed.com`
- Password: `admin123456` (min 8 caractères)
- Prénom: `Admin`
- Nom: `VIDMED`

### 4. Configurer le Frontend

```bash
# Depuis la racine du projet
cd vidmed-frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Le fichier .env devrait contenir:
# VITE_API_URL=http://localhost:8000
# (déjà configuré par défaut)

# Démarrer le serveur de développement
npm run dev
```

**Frontend démarré:** `http://localhost:5173`

---

## 🎯 Accéder à l'Application

### Frontend React
- **URL:** http://localhost:5173
- **Login:** admin / admin123456 (ou votre mot de passe)

### Admin Django
- **URL:** http://localhost:8000/admin/
- **Login:** admin / admin123456 (ou votre mot de passe)

### API REST
- **Base URL:** http://localhost:8000/api/
- **Documentation:** http://localhost:8000/api/schema/swagger-ui/

---

## 🧪 Tester l'Installation

### Backend

```bash
cd vidmed-backend

# Test avec Docker
docker-compose exec web python test_backend.py

# Ou sans Docker (nécessite Python + dépendances)
python test_backend.py
```

**Résultat attendu:** 17/17 tests réussis (100%)

### Frontend

```bash
cd vidmed-frontend

# Vérifier la compilation TypeScript
npm run type-check

# Vérifier le linting
npm run lint

# Build de production
npm run build
```

**Résultat attendu:** Aucune erreur

---

## 📊 Fonctionnalités Disponibles

Une fois connecté, vous aurez accès à:

### Manager
- ✅ Dashboard (8 statistiques)
- ✅ Rapports journaliers
- ✅ Dépenses
- ✅ Dettes patients (lecture seule)

### Superuser
- ✅ Tout ce que Manager peut faire
- ✅ Dettes entreprise
- ✅ Transactions propriétaire
- ✅ Flux de trésorerie
- ✅ Comparaisons périodes
- ✅ Balance SYSCOHADA

### Grand Superuser (admin)
- ✅ Tout ce que Superuser peut faire
- ✅ Gestion utilisateurs
- ✅ Gestion cliniques
- ✅ Codes comptables
- ✅ Système complet

---

## 🐳 Commandes Docker Utiles

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f web

# Redémarrer un service
docker-compose restart web

# Exécuter une commande dans le container
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser

# Reconstruire les images (après modification)
docker-compose build --no-cache
docker-compose up -d

# Supprimer tout (containers + volumes)
docker-compose down -v
```

---

## 🔧 Dépannage

### Problème: "Port 8000 already in use"

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Problème: "Port 3306 already in use" (MySQL)

Vous avez déjà MySQL installé localement. Options:

1. **Arrêter MySQL local:**
   ```bash
   # Windows (Services)
   net stop MySQL80
   
   # Linux/Mac
   sudo service mysql stop
   ```

2. **Changer le port dans docker-compose.yml:**
   ```yaml
   mysql:
     ports:
       - "3307:3306"  # Port externe différent
   ```

### Problème: Frontend ne se connecte pas au backend

Vérifier que:
1. Le backend tourne: `http://localhost:8000/api/`
2. CORS est activé dans `settings.py`
3. `.env` du frontend contient: `VITE_API_URL=http://localhost:8000`

### Problème: Migrations non appliquées

```bash
# Avec Docker
docker-compose exec web python manage.py migrate

# Sans Docker
python manage.py migrate
```

### Problème: Erreur "ModuleNotFoundError"

Réinstaller les dépendances:

```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

---

## 📚 Documentation Complète

- **README principal:** [README.md](./README.md)
- **Backend:** [vidmed-backend/README.md](./vidmed-backend/README.md)
- **Frontend:** [vidmed-frontend/README.md](./vidmed-frontend/README.md)
- **Déploiement:** [vidmed-backend/DEPLOYMENT.md](./vidmed-backend/DEPLOYMENT.md)
- **Rapports:** [Rapport/](./Rapport/)

---

## 🎓 Prochaines Étapes

### Pour le Développement

1. **Créer des données de test:**
   ```bash
   docker-compose exec web python manage.py shell
   ```

2. **Explorer l'API:**
   - http://localhost:8000/api/
   - Utiliser Postman ou Insomnia
   - Tester avec curl

3. **Modifier le code:**
   - Hot reload activé pour frontend (Vite)
   - Hot reload activé pour backend (runserver)

### Pour la Production

1. **Configurer les variables d'environnement**
2. **Déployer le backend** sur Render.com
3. **Déployer le frontend** sur Vercel
4. **Configurer MySQL** sur Railway
5. **Configurer Redis** sur Upstash

Guide complet: [vidmed-backend/DEPLOYMENT.md](./vidmed-backend/DEPLOYMENT.md)

---

## 💡 Conseils

### Performance

- Utilisez Docker pour le développement (plus simple)
- Le backend redémarre automatiquement lors des modifications
- Le frontend recharge instantanément (Vite HMR)

### Sécurité

- Changez le SECRET_KEY en production
- Utilisez des mots de passe forts
- Ne commitez jamais les fichiers .env
- Activez HTTPS en production

### Base de Données

- Les données sont persistées dans un volume Docker
- Pour reset la DB: `docker-compose down -v`
- Pour backup: `docker-compose exec mysql mysqldump -u vidmed -p vidmed > backup.sql`

---

## 🤝 Besoin d'Aide?

- **GitHub Issues:** https://github.com/jeansuzanmarc/Vidmed_cashflow/issues
- **Documentation:** [Rapport/00-LISEZ-MOI-EN-PREMIER.md](./Rapport/00-LISEZ-MOI-EN-PREMIER.md)

---

## ✅ Checklist de Démarrage

- [ ] Docker Desktop installé et lancé
- [ ] Repository cloné
- [ ] Backend démarré (`docker-compose up -d`)
- [ ] Migrations appliquées
- [ ] Superuser créé
- [ ] Frontend démarré (`npm run dev`)
- [ ] Login réussi sur http://localhost:5173
- [ ] Dashboard visible avec statistiques

**Une fois tous les points cochés, vous êtes prêt! 🎉**

---

**© 2026 VIDMED - Cash Flow Management System**
