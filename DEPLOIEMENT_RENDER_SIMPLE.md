# 🚀 Déployer VIDMED sur Render - Guide Ultra Simple

**Temps:** 15 minutes  
**Coût:** $0 (Gratuit)

---

## 🎯 Ce que vous allez faire

```
GitHub (votre code) → Render (hébergement gratuit) → Application en ligne
```

---

## 📝 ÉTAPE 1: Créer un compte Render (2 min)

1. Allez sur: **https://render.com**
2. Cliquez **"Get Started"**
3. Choisissez **"Sign in with GitHub"**
4. Autorisez Render

✅ **C'est fait!** Vous êtes dans le Dashboard Render.

---

## 🗄️ ÉTAPE 2: Créer la base de données (3 min)

### A. Créer PostgreSQL

1. Dans Dashboard, cliquez le gros bouton **"New +"**
2. Choisissez **"PostgreSQL"**
3. Remplissez:
   ```
   Name: vidmed-db
   Database: vidmed
   User: vidmed
   Region: Oregon (US West)
   ```
4. Plan: **FREE** ← Important!
5. Cliquez **"Create Database"**

⏱️ Attendez 2 minutes (barre de progression)

### B. Copier l'URL de connexion

1. Une fois créée, allez dans l'onglet **"Info"**
2. Cherchez **"Internal Database URL"**
3. Cliquez sur l'icône 📋 pour copier
4. **Collez-la dans un notepad** (vous en aurez besoin!)

```
Exemple: postgresql://vidmed:xxxxx@dpg-xxxxx-a/vidmed
```

---

## 🔴 ÉTAPE 3: Créer Redis (2 min)

1. Cliquez **"New +"**
2. Choisissez **"Redis"**
3. Remplissez:
   ```
   Name: vidmed-redis
   Region: Oregon (US West)
   ```
4. Plan: **FREE**
5. Cliquez **"Create Redis"**

⏱️ Attendez 1 minute

### B. Copier le Redis URL

1. Onglet "Info"
2. Copiez **"Internal Redis URL"**
3. **Collez dans le notepad**

```
Exemple: redis://red-xxxxx:6379
```

---

## 🌐 ÉTAPE 4: Déployer le Backend (5 min)

### A. Créer le Web Service

1. Cliquez **"New +"**
2. Choisissez **"Web Service"**
3. Cliquez **"Build and deploy from a Git repository"**
4. Cherchez et sélectionnez: **`vidmed-website`**
5. Cliquez **"Connect"**

### B. Configuration

**Informations:**
```
Name: vidmed-backend
Region: Oregon (US West)
Branch: main
Root Directory: vidmed-backend  ← Important!
```

**Runtime:**
```
Runtime: Python 3
```

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
```

**Start Command:**
```bash
gunicorn vidmed_project.wsgi:application
```

**Plan:** 
- Sélectionnez **FREE** ($0/month)

### C. Variables d'Environnement

Cliquez **"Advanced"**, puis **"Add Environment Variable"** pour chaque ligne:

| Variable | Valeur | Comment |
|----------|--------|---------|
| `PYTHON_VERSION` | `3.11.0` | |
| `DEBUG` | `False` | |
| `SECRET_KEY` | Cliquez "Generate" | ← Important! |
| `ALLOWED_HOSTS` | `vidmed-backend.onrender.com` | |
| `DATABASE_URL` | Collez l'URL PostgreSQL du notepad | ← Important! |
| `REDIS_URL` | Collez l'URL Redis du notepad | ← Important! |

### D. Déployer!

1. Vérifiez tout
2. Cliquez le gros bouton bleu **"Create Web Service"**
3. ☕ **Attendez 5-10 minutes** (première fois est plus longue)

Vous verrez:
```
Deploying...
Building...
Starting...
✅ Live
```

### E. Tester

Votre API est maintenant en ligne!

**URL:** `https://vidmed-backend.onrender.com/api/`

Ouvrez cette URL dans votre navigateur → Vous devriez voir la page API!

---

## 👤 ÉTAPE 5: Créer votre compte admin (2 min)

1. Dans votre service `vidmed-backend` sur Render
2. Cliquez l'onglet **"Shell"** (en haut)
3. Cliquez **"Launch Shell"**
4. Une console s'ouvre, tapez:

```bash
python create_admin.py
```

5. Appuyez **Entrée**

✅ **Terminé!** Votre compte est créé:
- Username: `jeansuzanmarc`
- Password: `jeansuzanmarc`

---

## 🎉 C'EST FAIT!

Votre backend est en ligne! Testez:

### Admin Django
**URL:** `https://vidmed-backend.onrender.com/admin/`

Login:
- Username: `jeansuzanmarc`
- Password: `jeansuzanmarc`

### API
**URL:** `https://vidmed-backend.onrender.com/api/`

---

## 📱 BONUS: Déployer le Frontend sur Vercel (5 min)

### A. Créer compte Vercel

1. Allez sur: **https://vercel.com**
2. **"Sign Up"** avec GitHub

### B. Importer le projet

1. Cliquez **"Add New..."** → **"Project"**
2. Sélectionnez `vidmed-website`
3. Cliquez **"Import"**

### C. Configuration

```
Framework Preset: Vite
Root Directory: vidmed-frontend
Build Command: npm run build
Output Directory: dist
```

### D. Variable d'environnement

**Important!** Ajoutez une variable:

```
Name: VITE_API_URL
Value: https://vidmed-backend.onrender.com
```

### E. Déployer

Cliquez **"Deploy"**

⏱️ Attendez 2-3 minutes

✅ **Frontend en ligne:** `https://vidmed-frontend.vercel.app`

---

## ✅ TOUT EST FINI!

Vous avez maintenant:

✅ Backend API: `https://vidmed-backend.onrender.com/api/`  
✅ Admin: `https://vidmed-backend.onrender.com/admin/`  
✅ Frontend: `https://vidmed-frontend.vercel.app`

**Testez le frontend:**
1. Ouvrez `https://vidmed-frontend.vercel.app`
2. Login: `jeansuzanmarc` / `jeansuzanmarc`
3. Vous voyez le dashboard!

---

## 🎯 URLs Finales

| Service | URL |
|---------|-----|
| **Frontend** | https://vidmed-frontend.vercel.app |
| **API** | https://vidmed-backend.onrender.com/api/ |
| **Admin** | https://vidmed-backend.onrender.com/admin/ |

---

## ❓ Problèmes?

### "Application failed to start"
→ Vérifiez les logs (onglet "Logs" dans Render)

### "Database connection error"
→ Vérifiez que `DATABASE_URL` est correct dans les variables

### "CORS error"
→ Dans Render, variable `ALLOWED_HOSTS`, ajoutez l'URL Vercel

### "Le service s'endort"
→ Normal! Plan gratuit = sommeil après 15 min. Premier accès = 30 secondes.

---

## 📞 Besoin d'aide?

- **Guide détaillé:** [DEPLOIEMENT_RENDER.md](./DEPLOIEMENT_RENDER.md)
- **GitHub Issues:** https://github.com/jeansuzanmarc/vidmed-website/issues

---

**🎉 FÉLICITATIONS! VIDMED est en production! 🚀**

*Temps total: ~15 minutes | Coût: $0*
