# 📦 Guide d'Installation VIDMED - Étape par Étape

**Temps estimé:** 2-3 heures  
**Difficulté:** Facile (je vous guide)

---

## 📋 Ce que Vous Allez Installer

1. ✅ Backend Django (Python) avec MySQL
2. ✅ Frontend React (TypeScript)
3. ✅ 12 tables de base de données
4. ✅ Système de codes de comptes
5. ✅ Données de démonstration

---

## 🛠️ Prérequis à Installer

### 1. Python 3.10 ou supérieur

**Vérifier si installé:**
```bash
python --version
```

**Si pas installé:**
- Windows: https://www.python.org/downloads/
- Cocher "Add Python to PATH" lors de l'installation

---

### 2. MySQL 8.0

**Option A: Installer MySQL seul**
- Télécharger: https://dev.mysql.com/downloads/installer/
- Choisir "Developer Default"
- Mémoriser le mot de passe root

**Option B: Installer XAMPP (Plus simple - Recommandé)**
- Télécharger: https://www.apachefriends.org/
- Installer
- Démarrer MySQL depuis le panneau de contrôle

---

### 3. Node.js 18 ou supérieur

**Vérifier si installé:**
```bash
node --version
npm --version
```

**Si pas installé:**
- Télécharger: https://nodejs.org/
- Installer la version LTS (Long Term Support)

---

### 4. Git

**Vérifier si installé:**
```bash
git --version
```

**Si pas installé:**
- Télécharger: https://git-scm.com/downloads
- Utiliser les options par défaut

---

## 📁 Structure des Dossiers

Créer cette structure:

```
C:\Users\Jean Suzan Marc\OneDrive\Desktop\VIDMED\
├── vidmed-backend/        (Django - à créer)
├── vidmed-frontend/       (React - à créer)
└── Rapport/              (Documentation - existe déjà)
```

**Commandes:**
```bash
cd "C:\Users\Jean Suzan Marc\OneDrive\Desktop\VIDMED"
mkdir vidmed-backend
mkdir vidmed-frontend
```

---

## 🔧 PARTIE 1: Installation Backend Django

### Étape 1.1: Créer la Base de Données MySQL

**Si vous utilisez XAMPP:**

1. Ouvrir XAMPP Control Panel
2. Démarrer "MySQL"
3. Cliquer sur "Admin" → phpMyAdmin s'ouvre dans navigateur
4. Cliquer sur onglet "SQL"
5. Copier-coller ce code:

```sql
-- Créer la base de données
CREATE DATABASE vidmed_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur
CREATE USER 'vidmed_user'@'localhost' IDENTIFIED BY 'Vidmed2024!';

-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON vidmed_db.* TO 'vidmed_user'@'localhost';
FLUSH PRIVILEGES;

-- Vérifier
SELECT 'Base de données créée avec succès!' AS Status;
```

6. Cliquer "Exécuter"

**Si vous utilisez MySQL en ligne de commande:**
```bash
mysql -u root -p
```
Puis coller le même code SQL ci-dessus.

**✅ Résultat:** Base `vidmed_db` créée avec utilisateur `vidmed_user`

---

### Étape 1.2: Configurer le Backend Django

Ouvrir Git Bash ou PowerShell dans le dossier VIDMED:

```bash
cd vidmed-backend

# Créer environnement virtuel Python
python -m venv venv

# Activer l'environnement (Git Bash)
source venv/Scripts/activate

# OU Activer (PowerShell)
# venv\Scripts\Activate.ps1

# ⚠️ Si erreur PowerShell "execution policy":
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**✅ Résultat:** Vous voyez `(venv)` devant votre prompt

---

### Étape 1.3: Installer Django et Dépendances

```bash
# Avec venv activé, installer Django
pip install Django==5.0.6
pip install djangorestframework==3.15.1
pip install djangorestframework-simplejwt==5.3.1
pip install django-cors-headers==4.3.1
pip install django-filter==24.2
pip install mysqlclient==2.2.4
pip install python-dotenv==1.0.1

# Sauvegarder les dépendances
pip freeze > requirements.txt
```

**⚠️ Si erreur avec mysqlclient sur Windows:**
```bash
pip install pymysql
```
(Je vais vous montrer la configuration plus tard)

**✅ Résultat:** Django et toutes les bibliothèques installés

---

### Étape 1.4: Créer le Projet Django

```bash
# Toujours dans vidmed-backend avec venv activé

# Créer le projet
django-admin startproject vidmed .

# Créer les applications
python manage.py startapp core
python manage.py startapp api
```

**✅ Résultat:** Structure Django créée

Vérifier la structure:
```
vidmed-backend/
├── venv/
├── vidmed/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── core/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── models.py
│   └── views.py
├── api/
│   └── (même structure)
├── manage.py
└── requirements.txt
```

---

### Étape 1.5: Configuration des Fichiers

Je vais maintenant créer tous les fichiers de configuration.

**Attendez les prochains fichiers que je vais créer:**
- `vidmed/.env` - Variables d'environnement
- `vidmed/settings.py` - Configuration Django
- `core/models.py` - Modèles de base de données
- `api/serializers.py` - Sérialiseurs API
- `api/views.py` - Vues API
- `api/urls.py` - Routes API

**➡️ Je vais créer ces fichiers dans les prochains messages**

Pour l'instant, continuez à lire...

---

## 🎨 PARTIE 2: Installation Frontend React

### Étape 2.1: Créer le Projet React

Ouvrir un NOUVEAU terminal (Git Bash ou PowerShell):

```bash
cd "C:\Users\Jean Suzan Marc\OneDrive\Desktop\VIDMED\vidmed-frontend"

# Créer projet React avec TypeScript
npx create-react-app . --template typescript

# Attendre 5-10 minutes (installation de ~1400 packages)
```

**✅ Résultat:** Projet React créé

---

### Étape 2.2: Installer les Dépendances Frontend

```bash
# Dans vidmed-frontend

# Material-UI (interface utilisateur)
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Autres bibliothèques
npm install axios react-router-dom
npm install recharts
npm install date-fns
```

**✅ Résultat:** Toutes les bibliothèques frontend installées

---

### Étape 2.3: Créer la Structure des Dossiers

```bash
# Dans vidmed-frontend/src

mkdir components
mkdir components/auth
mkdir components/manager
mkdir components/superuser
mkdir components/common
mkdir services
mkdir context
mkdir types
mkdir utils
```

**✅ Résultat:** Structure organisée

---

## 🔄 PARTIE 3: Créer les Fichiers du Projet

**Je vais maintenant créer tous les fichiers nécessaires.**

Dans les prochains messages, vous allez recevoir:

### Backend (Django):
1. ✅ `.env` - Configuration environnement
2. ✅ `vidmed/__init__.py` - Config pymysql
3. ✅ `vidmed/settings.py` - Settings complet
4. ✅ `core/models.py` - 12 modèles de base de données
5. ✅ `core/signals.py` - Génération auto transactions
6. ✅ `core/admin.py` - Interface admin
7. ✅ `api/serializers.py` - Sérialiseurs
8. ✅ `api/views.py` - Endpoints API
9. ✅ `api/urls.py` - Routes
10. ✅ `api/permissions.py` - Permissions
11. ✅ `core/management/commands/setup_accounts.py` - Commande init

### Frontend (React):
1. ✅ `.env` - Config API
2. ✅ `src/types/index.ts` - Types TypeScript
3. ✅ `src/services/api.ts` - Service API
4. ✅ `src/context/AuthContext.tsx` - Authentification
5. ✅ `src/components/auth/Login.tsx` - Page login
6. ✅ `src/components/manager/ManagerDashboard.tsx` - Interface manager
7. ✅ `src/components/superuser/SuperuserDashboard.tsx` - Interface superuser
8. ✅ `src/components/superuser/CashFlowDashboard.tsx` - Dashboard cash-flow
9. ✅ `src/App.tsx` - Application principale

---

## ⏭️ Prochaines Étapes

**NE FAITES RIEN POUR L'INSTANT**

Attendez que je crée tous les fichiers dans les prochains messages.

Ensuite, vous allez:

1. ✅ Copier-coller les fichiers que je donne
2. ✅ Exécuter les migrations
3. ✅ Créer un superuser
4. ✅ Initialiser les codes de comptes
5. ✅ Créer des données de test
6. ✅ Lancer le serveur backend
7. ✅ Lancer le serveur frontend
8. ✅ Tester le système

---

## 📝 Checklist Progression

Cochez au fur et à mesure:

### Prérequis
- [ ] Python 3.10+ installé
- [ ] MySQL/XAMPP installé et démarré
- [ ] Node.js 18+ installé
- [ ] Git installé

### Base de données
- [ ] Base `vidmed_db` créée
- [ ] Utilisateur `vidmed_user` créé

### Backend
- [ ] Dossier `vidmed-backend` créé
- [ ] Environnement virtuel créé et activé
- [ ] Django installé
- [ ] Projet Django créé
- [ ] Apps `core` et `api` créées
- [ ] Fichiers de config copiés (à venir)
- [ ] Migrations exécutées (à venir)

### Frontend
- [ ] Dossier `vidmed-frontend` créé
- [ ] Projet React créé
- [ ] Dépendances installées
- [ ] Structure des dossiers créée
- [ ] Fichiers React copiés (à venir)

### Tests
- [ ] Backend lance sans erreur
- [ ] Frontend lance sans erreur
- [ ] Login fonctionne
- [ ] Dashboard manager fonctionne
- [ ] Dashboard superuser fonctionne

---

## 🆘 En Cas de Problème

### Erreur: "Python not found"
```bash
# Vérifier que Python est dans le PATH
# Réinstaller Python en cochant "Add to PATH"
```

### Erreur: "MySQL connection failed"
```bash
# Vérifier que MySQL démarre
# Vérifier le mot de passe dans .env
# Tester: mysql -u vidmed_user -p vidmed_db
```

### Erreur: "Module 'MySQLdb' not found"
```bash
pip install pymysql
# Puis ajouter dans vidmed/__init__.py (je vais le faire)
```

### Erreur: "Port 8000 already in use"
```bash
# Trouver le process:
netstat -ano | findstr :8000
# Tuer le process:
taskkill /PID <numéro> /F
```

### Erreur: "npm command not found"
```bash
# Réinstaller Node.js
# Redémarrer le terminal
```

---

## 📊 Temps Estimé par Étape

| Étape | Temps |
|-------|-------|
| Installation prérequis | 30 min |
| Configuration MySQL | 10 min |
| Setup backend Django | 30 min |
| Setup frontend React | 30 min |
| Copier fichiers de config | 20 min |
| Migrations et tests | 20 min |
| Données de démo | 10 min |
| **TOTAL** | **~2h30** |

---

## ✅ Vous Êtes Prêt!

Si vous avez terminé jusqu'ici:
- ✅ Prérequis installés
- ✅ Base de données créée
- ✅ Structure Django créée
- ✅ Structure React créée

**➡️ Passez au document `02-MODELES-DJANGO.md`**

Ou attendez que je crée tous les fichiers de code dans les prochains messages.

---

**🎉 Bravo! Vous avez fait la partie la plus difficile (l'installation).**

**Maintenant, je vais créer tous les fichiers de code pour vous.**

---

**Version:** 2.0  
**Date:** 1er juin 2026  
**Status:** Guide d'installation prêt
