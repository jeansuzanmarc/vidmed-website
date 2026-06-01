# 🚀 Déploiement VIDMED sur Render - Guide Complet

**Temps estimé:** 15-20 minutes  
**Coût:** Gratuit (Free tier)

---

## 📋 Prérequis

- [x] Code publié sur GitHub: https://github.com/jeansuzanmarc/vidmed-website
- [x] Compte Render.com (à créer)
- [x] Compte GitHub (déjà fait)

---

## 🎯 Architecture de Déploiement

```
┌─────────────────────────────────────────┐
│            Render.com                    │
│                                          │
│  ┌────────────────┐   ┌──────────────┐ │
│  │  Web Service   │───│  PostgreSQL  │ │
│  │  (Django API)  │   │  Database    │ │
│  └────────────────┘   └──────────────┘ │
│         │                                │
│         │              ┌──────────────┐ │
│         └──────────────│    Redis     │ │
│                        └──────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📝 Étape 1: Créer un Compte Render

1. Allez sur **https://render.com**
2. Cliquez sur **"Get Started"**
3. Connectez-vous avec **GitHub**
4. Autorisez Render à accéder à vos repositories

✅ Compte créé!

---

## 🗄️ Étape 2: Créer la Base de Données PostgreSQL

### 2.1 Créer la Database

1. Dans le Dashboard Render, cliquez **"New +"**
2. Sélectionnez **"PostgreSQL"**
3. Configurez:
   - **Name:** `vidmed-db`
   - **Database:** `vidmed`
   - **User:** `vidmed`
   - **Region:** `Oregon (US West)` ou proche de vous
   - **Plan:** **Free**
4. Cliquez **"Create Database"**

⏱️ Attendez 2-3 minutes que la DB soit prête.

### 2.2 Noter les Credentials

Une fois créée, notez ces informations (onglet "Info"):

```
Hostname: dpg-xxxxx-a.oregon-postgres.render.com
Port: 5432
Database: vidmed
Username: vidmed
Password: [généré automatiquement]

Internal Database URL: postgresql://vidmed:xxxxx@dpg-xxxxx-a/vidmed
External Database URL: postgresql://vidmed:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/vidmed
```

⚠️ **Important:** Copiez le **Internal Database URL** (sera utilisé plus tard)

---

## 🔴 Étape 3: Créer le Service Redis

1. Dans le Dashboard, cliquez **"New +"**
2. Sélectionnez **"Redis"**
3. Configurez:
   - **Name:** `vidmed-redis`
   - **Region:** `Oregon (US West)` (même région que la DB)
   - **Plan:** **Free** (25 MB)
   - **Maxmemory Policy:** `allkeys-lru`
4. Cliquez **"Create Redis"**

⏱️ Attendez 1-2 minutes.

### 3.1 Noter le Redis URL

Une fois créé, copiez le **Internal Redis URL**:

```
redis://red-xxxxx:6379
```

---

## 🌐 Étape 4: Déployer le Backend Django

### 4.1 Créer le Web Service

1. Dans le Dashboard, cliquez **"New +"**
2. Sélectionnez **"Web Service"**
3. Sélectionnez **"Build and deploy from a Git repository"**
4. Cliquez **"Next"**

### 4.2 Connecter GitHub Repository

1. Cherchez et sélectionnez: **`vidmed-website`**
2. Cliquez **"Connect"**

### 4.3 Configurer le Service

**Informations de base:**
- **Name:** `vidmed-backend`
- **Region:** `Oregon (US West)`
- **Branch:** `main`
- **Root Directory:** `vidmed-backend`

**Build Settings:**
- **Runtime:** `Python 3`
- **Build Command:**
  ```bash
  pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
  ```
- **Start Command:**
  ```bash
  gunicorn vidmed_project.wsgi:application
  ```

**Plan:**
- Sélectionnez **"Free"** ($0/month)

### 4.4 Variables d'Environnement

Cliquez sur **"Advanced"** puis ajoutez ces variables:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `DEBUG` | `False` |
| `SECRET_KEY` | Cliquez "Generate" |
| `ALLOWED_HOSTS` | `vidmed-backend.onrender.com` |
| `DATABASE_URL` | Coller le **Internal Database URL** de l'étape 2 |
| `REDIS_URL` | Coller le **Internal Redis URL** de l'étape 3 |
| `DJANGO_SETTINGS_MODULE` | `vidmed_project.settings` |

**Variables optionnelles (pour plus tard):**

| Key | Value | Description |
|-----|-------|-------------|
| `TWILIO_ACCOUNT_SID` | (votre SID) | Pour WhatsApp |
| `TWILIO_AUTH_TOKEN` | (votre token) | Pour WhatsApp |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | Numéro Twilio |
| `FIREBASE_CREDENTIALS` | (JSON) | Pour notifications |

### 4.5 Lancer le Déploiement

1. Vérifiez toutes les informations
2. Cliquez **"Create Web Service"**

⏱️ **Attendez 5-10 minutes** que le déploiement se termine.

### 4.6 Vérifier le Déploiement

Une fois terminé, vous verrez **"Live"** en vert.

**Testez votre API:**
- URL: `https://vidmed-backend.onrender.com/api/`
- Admin: `https://vidmed-backend.onrender.com/admin/`

---

## 🔧 Étape 5: Créer le Superuser en Production

### Option 1: Via Render Shell

1. Dans votre service `vidmed-backend`, allez dans l'onglet **"Shell"**
2. Cliquez **"Launch Shell"**
3. Exécutez:
   ```bash
   python create_admin.py
   ```

### Option 2: Via Django Admin Creation

Dans le Shell:
```bash
python manage.py createsuperuser
```

Entrez:
- Username: `jeansuzanmarc`
- Email: `jeansuzanmarc@gmail.com`
- Password: (votre mot de passe)

---

## ✅ Étape 6: Tester l'Application

### 6.1 Tester l'API

```bash
# Test de base
curl https://vidmed-backend.onrender.com/api/

# Test login
curl -X POST https://vidmed-backend.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"jeansuzanmarc","password":"votre_mot_de_passe"}'
```

### 6.2 Tester Django Admin

1. Ouvrez: `https://vidmed-backend.onrender.com/admin/`
2. Connectez-vous avec vos credentials
3. Vérifiez que tout fonctionne

---

## 📱 Étape 7: Déployer le Frontend sur Vercel

### 7.1 Créer Compte Vercel

1. Allez sur **https://vercel.com**
2. Cliquez **"Sign Up"**
3. Connectez avec **GitHub**

### 7.2 Importer le Projet

1. Cliquez **"Add New..."** → **"Project"**
2. Sélectionnez **"Import Git Repository"**
3. Cherchez `vidmed-website`
4. Cliquez **"Import"**

### 7.3 Configurer le Build

- **Framework Preset:** `Vite`
- **Root Directory:** `vidmed-frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 7.4 Variables d'Environnement

Ajoutez:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://vidmed-backend.onrender.com` |

### 7.5 Déployer

1. Cliquez **"Deploy"**
2. Attendez 2-3 minutes

✅ Frontend déployé sur: `https://vidmed-frontend.vercel.app`

---

## 🎉 Étape 8: Configurer le CORS

### 8.1 Mettre à jour ALLOWED_HOSTS

Dans Render, éditez les variables d'environnement du backend:

```
ALLOWED_HOSTS=vidmed-backend.onrender.com,vidmed-frontend.vercel.app
```

### 8.2 Vérifier CORS_ALLOWED_ORIGINS

Dans `vidmed-backend/vidmed_project/settings.py`, vérifiez:

```python
CORS_ALLOWED_ORIGINS = [
    "https://vidmed-frontend.vercel.app",
    "http://localhost:5173",  # Pour dev local
]
```

---

## 📊 Résumé des URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | https://vidmed-frontend.vercel.app | - |
| **API** | https://vidmed-backend.onrender.com/api/ | - |
| **Admin** | https://vidmed-backend.onrender.com/admin/ | jeansuzanmarc / votre_pass |
| **Database** | dpg-xxxxx-a.oregon-postgres.render.com | (auto) |
| **Redis** | red-xxxxx:6379 | (auto) |

---

## 🔧 Dépannage

### Problème: "Application failed to start"

**Solution:**
1. Vérifiez les logs dans Render (onglet "Logs")
2. Vérifiez que `DATABASE_URL` et `REDIS_URL` sont corrects
3. Relancez le déploiement: **"Manual Deploy"** → **"Clear build cache & deploy"**

### Problème: "Database connection failed"

**Solution:**
1. Vérifiez que la DB PostgreSQL est bien "Available"
2. Utilisez le **Internal Database URL** (pas External)
3. Vérifiez que le backend et la DB sont dans la même région

### Problème: "Static files not found"

**Solution:**
1. Vérifiez que `collectstatic` est dans le Build Command
2. Ajoutez `whitenoise` dans MIDDLEWARE (déjà fait)
3. Redéployez

### Problème: "CORS error" dans le frontend

**Solution:**
1. Vérifiez `CORS_ALLOWED_ORIGINS` dans settings.py
2. Ajoutez l'URL Vercel du frontend
3. Committez et poussez sur GitHub
4. Render redéploiera automatiquement

---

## 🎯 Commandes Utiles

### Voir les Logs en Temps Réel

Dans Render Dashboard:
1. Cliquez sur votre service
2. Onglet **"Logs"**
3. Activez **"Live tail"**

### Redéployer Manuellement

1. Onglet **"Manual Deploy"**
2. Cliquez **"Deploy latest commit"**
3. Ou **"Clear build cache & deploy"** pour rebuild complet

### Accéder au Shell

1. Onglet **"Shell"**
2. Cliquez **"Launch Shell"**
3. Exécutez vos commandes Django

---

## 💡 Optimisations (Optionnel)

### 1. Domaine Personnalisé

Dans Render:
1. Onglet **"Settings"**
2. Section **"Custom Domain"**
3. Ajoutez: `api.vidmed.com`
4. Configurez les DNS

### 2. Activer Auto-Deploy

Déjà activé par défaut! Chaque push sur `main` déclenchera un nouveau déploiement.

### 3. Monitoring

Dans Render Dashboard:
- Onglet **"Metrics"** - CPU, Memory, Request rate
- Onglet **"Events"** - Historique des déploiements

---

## 📈 Limites du Plan Gratuit

| Service | Limite | Suffisant pour |
|---------|--------|----------------|
| Web Service | 750h/mois | Oui ✅ |
| PostgreSQL | 1GB | 10,000+ records ✅ |
| Redis | 25MB | Cache basique ✅ |
| Bandwidth | 100GB/mois | Usage modéré ✅ |

**Note:** Le service s'endort après 15 min d'inactivité. Premier démarrage = 30-60 secondes.

---

## ✅ Checklist de Déploiement

- [ ] Compte Render créé
- [ ] PostgreSQL database créée
- [ ] Redis instance créée
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement configurées
- [ ] Superuser créé en production
- [ ] Frontend déployé sur Vercel
- [ ] CORS configuré
- [ ] URLs testées (API + Admin + Frontend)
- [ ] Login testé sur le frontend

---

## 🎓 Prochaines Étapes

1. **Configurer Twilio** pour les alertes WhatsApp
2. **Configurer Firebase** pour les notifications push
3. **Ajouter un domaine personnalisé** (optionnel)
4. **Configurer les backups** de la base de données
5. **Monitorer les performances**

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Issues:** https://github.com/jeansuzanmarc/vidmed-website/issues

---

**🎉 Félicitations! VIDMED est maintenant en production! 🚀**

**© 2026 VIDMED - Deployed on Render.com**
