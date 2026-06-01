# 🚀 Guide de déploiement VIDMED sur Render (GRATUIT)

Ce guide vous permet de déployer le backend VIDMED sur Render avec le plan gratuit.

## 📋 Ce que vous aurez besoin

1. **Compte GitHub** - pour héberger le code
2. **Compte Render** - [render.com](https://render.com) (gratuit)
3. **Compte Railway/PlanetScale** - pour MySQL gratuit
4. **Compte Upstash** - pour Redis gratuit
5. **Compte Twilio** - pour WhatsApp (essai gratuit)
6. **Projet Firebase** - pour notifications push (gratuit)

## Étape 1: Préparer le code sur GitHub

### 1.1 Créer un dépôt GitHub

```bash
cd vidmed-backend
git init
git add .
git commit -m "Initial commit: VIDMED Backend v2.0"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/vidmed-backend.git
git push -u origin main
```

### 1.2 Vérifier les fichiers nécessaires

Assurez-vous que ces fichiers sont bien présents:
- ✅ `requirements.txt`
- ✅ `Dockerfile`
- ✅ `docker-entrypoint.sh`
- ✅ `.env.example`
- ✅ `README.md`

## Étape 2: Base de données MySQL gratuite

### Option A: Railway (Recommandé)

1. Aller sur [railway.app](https://railway.app)
2. Se connecter avec GitHub
3. Cliquer "New Project" → "Provision MySQL"
4. Copier les credentials:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

### Option B: PlanetScale

1. Aller sur [planetscale.com](https://planetscale.com)
2. Créer un compte gratuit
3. Créer une base de données "vidmed"
4. Copier la connection string

## Étape 3: Redis gratuit avec Upstash

1. Aller sur [upstash.com](https://upstash.com)
2. Créer un compte
3. Créer une base Redis gratuite
4. Région: choisir la plus proche (ex: eu-west-1)
5. Copier `UPSTASH_REDIS_REST_URL`:
   ```
   redis://default:xxxxx@xxxxx.upstash.io:6379
   ```

## Étape 4: Déployer sur Render

### 4.1 Créer le service Web

1. Aller sur [render.com](https://render.com)
2. Se connecter avec GitHub
3. Cliquer "New +" → "Web Service"
4. Connecter votre dépôt `vidmed-backend`
5. Configurer:

**Name:** `vidmed-backend`

**Environment:** `Docker`

**Region:** `Frankfurt (EU Central)` ou proche de votre localisation

**Branch:** `main`

**Plan:** `Free`

### 4.2 Variables d'environnement

Dans l'onglet "Environment", ajouter:

```env
# Django
SECRET_KEY=générer-une-clé-sécurisée-de-50-caractères
DEBUG=False
ALLOWED_HOSTS=vidmed-backend.onrender.com

# Database (de Railway/PlanetScale)
DB_NAME=vidmed
DB_USER=votre_user
DB_PASSWORD=votre_password
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6543

# Redis (d'Upstash)
REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379
CELERY_BROKER_URL=redis://default:xxxxx@xxxxx.upstash.io:6379

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Firebase (voir étape 5)
FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json

# CORS (votre frontend)
CORS_ALLOWED_ORIGINS=https://vidmed-frontend.vercel.app

# Timezone
TIME_ZONE=America/Port-au-Prince
```

### 4.3 Générer SECRET_KEY

Sur votre machine locale:

```python
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Copiez le résultat dans `SECRET_KEY`.

### 4.4 Déployer

Cliquer "Create Web Service". Render va:
1. Cloner votre dépôt
2. Build l'image Docker
3. Exécuter les migrations
4. Démarrer le serveur

⏱️ Cela prend environ 5-10 minutes.

## Étape 5: Configurer Firebase

### 5.1 Créer un projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Créer un nouveau projet "VIDMED"
3. Activer Cloud Messaging

### 5.2 Obtenir les credentials

1. Aller dans "Project Settings" (⚙️)
2. Onglet "Service Accounts"
3. Cliquer "Generate new private key"
4. Télécharger `firebase-credentials.json`

### 5.3 Ajouter à Render

**Option A: Secret Files** (Recommandé)

Dans Render Dashboard → votre service → "Environment":
1. Cliquer "Add Secret File"
2. Filename: `firebase-credentials.json`
3. Coller le contenu du fichier JSON
4. Save

**Option B: Variable d'environnement**

```bash
# Sur votre machine
cat firebase-credentials.json | tr -d '\n' | base64
```

Ajouter variable:
```env
FIREBASE_CREDENTIALS_BASE64=<résultat_base64>
```

Modifier `services/notification_service.py`:
```python
import base64
import json
import os

cred_base64 = os.getenv('FIREBASE_CREDENTIALS_BASE64')
if cred_base64:
    cred_json = base64.b64decode(cred_base64).decode('utf-8')
    cred_dict = json.loads(cred_json)
    cred = credentials.Certificate(cred_dict)
else:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
```

## Étape 6: Déployer Celery Worker

Render Free ne permet qu'un seul service web gratuit, mais vous pouvez utiliser **Background Workers**.

### Option A: Utiliser Render Background Worker (Payant $7/mois)

Si vous avez le budget:
1. Render Dashboard → "New +" → "Background Worker"
2. Même dépôt que le backend
3. Start Command: `celery -A vidmed_project worker -l info`
4. Même variables d'environnement

### Option B: Utiliser Railway pour Celery (Gratuit limité)

1. Railway Dashboard
2. "New Project" → Connecter GitHub repo
3. Service 1: Celery Worker
   - Start Command: `celery -A vidmed_project worker -l info`
   - Variables d'environnement identiques

4. Service 2: Celery Beat
   - Start Command: `celery -A vidmed_project beat -l info`
   - Variables d'environnement identiques

### Option C: Sans Celery (Pas d'alertes automatiques)

Si budget limité, vous pouvez désactiver Celery:
- ❌ Pas d'alertes WhatsApp automatiques à 20h00
- ❌ Pas de résumés mensuels automatiques
- ✅ Le reste du système fonctionne normalement

## Étape 7: Créer le premier utilisateur

### 7.1 Via Shell Render

1. Render Dashboard → votre service
2. Onglet "Shell"
3. Exécuter:

```python
python manage.py shell

from core.models import User, Clinic

# Créer une clinique
clinic = Clinic.objects.create(
    name="Clinique VIDMED",
    address="Port-au-Prince, Haïti",
    phone="+50937123456",
    email="contact@vidmed.com"
)

# Créer Grand Superuser
user = User.objects.create_superuser(
    username='admin',
    email='admin@vidmed.com',
    password='ChangeMeNow123!',
    role='grand_superuser',
    first_name='Admin',
    last_name='VIDMED'
)

print(f"✅ Clinique créée: {clinic.id}")
print(f"✅ Admin créé: {user.username}")
exit()
```

### 7.2 Se connecter

```bash
curl -X POST https://vidmed-backend.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "ChangeMeNow123!"
  }'
```

Vous devriez recevoir un token JWT.

## Étape 8: Peupler les codes de compte

Créer un fichier `populate_codes.py` et l'exécuter via Shell:

```python
from core.models import AccountCode

codes = [
    # Revenus
    {'code': 'REV_CONSULTATION', 'name': 'Consultations médicales', 'account_type': 'revenue', 'category': 'medical_services'},
    {'code': 'REV_PHARMACIE', 'name': 'Ventes pharmacie', 'account_type': 'revenue', 'category': 'pharmacy'},
    {'code': 'REV_LABORATOIRE', 'name': 'Analyses laboratoire', 'account_type': 'revenue', 'category': 'laboratory'},
    {'code': 'REV_RADIOLOGIE', 'name': 'Examens radiologie', 'account_type': 'revenue', 'category': 'radiology'},
    {'code': 'REV_CHIRURGIE', 'name': 'Actes chirurgicaux', 'account_type': 'revenue', 'category': 'surgery'},
    {'code': 'REV_AUTRE', 'name': 'Autres revenus', 'account_type': 'revenue', 'category': 'other'},
    {'code': 'REC_DETTE', 'name': 'Recouvrement dettes patients', 'account_type': 'revenue', 'category': 'other'},

    # Dépenses - Salaires
    {'code': 'SAL_MEDECIN', 'name': 'Salaire médecins', 'account_type': 'expense', 'category': 'salaries'},
    {'code': 'SAL_INFIRMIER', 'name': 'Salaire infirmiers', 'account_type': 'expense', 'category': 'salaries'},
    {'code': 'SAL_ADMIN', 'name': 'Salaire personnel administratif', 'account_type': 'expense', 'category': 'salaries'},

    # Dépenses - Achats
    {'code': 'ACH_MEDICAMENT', 'name': 'Achat médicaments', 'account_type': 'expense', 'category': 'medications'},
    {'code': 'ACH_FOURNITURE', 'name': 'Achat fournitures médicales', 'account_type': 'expense', 'category': 'supplies'},
    {'code': 'ACH_EQUIPEMENT', 'name': 'Achat équipement médical', 'account_type': 'expense', 'category': 'equipment'},

    # Dépenses - Charges
    {'code': 'CHG_ELECTRICITE', 'name': 'Électricité', 'account_type': 'expense', 'category': 'utilities'},
    {'code': 'CHG_EAU', 'name': 'Eau', 'account_type': 'expense', 'category': 'utilities'},
    {'code': 'CHG_LOYER', 'name': 'Loyer', 'account_type': 'expense', 'category': 'rent'},
    {'code': 'CHG_ASSURANCE', 'name': 'Assurance', 'account_type': 'expense', 'category': 'insurance'},
    {'code': 'CHG_ENTRETIEN', 'name': 'Entretien et maintenance', 'account_type': 'expense', 'category': 'maintenance'},

    # Dettes entreprise
    {'code': 'FRN_FOURNISSEUR', 'name': 'Paiement fournisseurs', 'account_type': 'expense', 'category': 'other'},

    # Capital
    {'code': 'CAP_APPORT', 'name': 'Apport capital propriétaire', 'account_type': 'revenue', 'category': 'other'},
    {'code': 'CAP_RETRAIT', 'name': 'Retrait propriétaire', 'account_type': 'expense', 'category': 'other'},
]

for code_data in codes:
    AccountCode.objects.get_or_create(
        code=code_data['code'],
        defaults=code_data
    )

print(f"✅ {len(codes)} codes de compte créés")
```

## Étape 9: Tester l'API

### Test 1: Health Check

```bash
curl https://vidmed-backend.onrender.com/api/
```

### Test 2: Login

```bash
curl -X POST https://vidmed-backend.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "ChangeMeNow123!"}'
```

### Test 3: Dashboard

```bash
TOKEN="votre_access_token"

curl https://vidmed-backend.onrender.com/api/dashboard/1/ \
  -H "Authorization: Bearer $TOKEN"
```

## Étape 10: Monitoring et logs

### Voir les logs

Render Dashboard → votre service → "Logs"

### Configurer les alertes

1. Render Dashboard → "Notifications"
2. Ajouter email pour recevoir alertes de crash
3. Configurer Uptime monitoring (optionnel)

### Backup automatique MySQL

Railway et PlanetScale font des backups automatiques quotidiens.

## 🎯 URLs finales

Après déploiement, vous aurez:

- **Backend API:** `https://vidmed-backend.onrender.com`
- **Admin Django:** `https://vidmed-backend.onrender.com/admin`
- **MySQL:** Hébergé sur Railway/PlanetScale
- **Redis:** Hébergé sur Upstash

## ⚠️ Limitations du plan gratuit

### Render Free Tier

- ✅ 750 heures/mois gratuites
- ⚠️ Service se met en veille après 15 min d'inactivité
- ⚠️ Redémarrage peut prendre 30-60 secondes
- ❌ Pas de custom domain SSL gratuit
- ✅ 100 GB bandwidth/mois

### Solutions aux limitations

**1. Temps de démarrage (cold start)**

Utiliser un service comme [UptimeRobot](https://uptimerobot.com) (gratuit):
- Ping votre backend toutes les 5 minutes
- Garde le service actif

**2. Celery Worker**

Options:
- Railway gratuit (500h/mois)
- Désactiver si budget limité
- Passer à plan payant Render ($7/mois)

## 🔒 Sécurité en production

### 1. Changer les secrets

```env
SECRET_KEY=<générer_nouvelle_clé_50_caractères>
# Changer aussi password admin
```

### 2. Configurer HTTPS uniquement

Dans `settings.py`:
```python
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
```

### 3. Limiter les requêtes (Rate Limiting)

Installer:
```bash
pip install django-ratelimit
```

Utiliser dans views critiques.

## 📊 Métriques et performances

### Monitor via Render

Dashboard → "Metrics" vous montre:
- CPU usage
- Memory usage
- Requests per minute
- Response times

### Optimiser les performances

1. **Cache Redis** - déjà configuré ✅
2. **Vue matérialisée** - déjà utilisée ✅
3. **Index database** - déjà créés ✅
4. **Pagination** - déjà activée (50/page) ✅

## 🆘 Dépannage

### Problème: Service ne démarre pas

**Solution:** Vérifier logs Render:
```
Render Dashboard → Logs
```

Erreurs communes:
- ❌ `ModuleNotFoundError` → manque dépendance dans `requirements.txt`
- ❌ `Can't connect to MySQL` → vérifier DB_HOST, DB_PORT
- ❌ `Invalid Redis URL` → vérifier REDIS_URL

### Problème: Migrations échouent

**Solution:** Exécuter manuellement via Shell:
```python
python manage.py migrate --fake-initial
```

### Problème: Static files 404

**Solution:** 
```python
python manage.py collectstatic --noinput
```

## ✅ Checklist finale

Avant de lancer en production:

- [ ] MySQL configuré et accessible
- [ ] Redis configuré
- [ ] Toutes les variables d'environnement définies
- [ ] Firebase credentials ajouté
- [ ] Premier admin créé
- [ ] Codes de compte peuplés
- [ ] Test login réussi
- [ ] Test dashboard réussi
- [ ] Celery Worker déployé (optionnel)
- [ ] Backup database configuré
- [ ] Monitoring activé
- [ ] Documentation à jour

## 🚀 Prochaines étapes

Maintenant que le backend est déployé:

1. **Déployer le frontend** sur Vercel/Netlify
2. **Connecter frontend au backend** (modifier CORS_ALLOWED_ORIGINS)
3. **Tester le système complet**
4. **Former les utilisateurs**

---

**Félicitations! 🎉 Votre backend VIDMED est maintenant en production!**

Pour toute question: support@vidmed.com
