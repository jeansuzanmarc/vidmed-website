# 🎯 VIDMED - Système de Gestion Cash-Flow pour Cliniques

## 📋 Vue d'Ensemble

Bienvenue dans **VIDMED**, un système simple et efficace pour gérer le flux de trésorerie de vos cliniques en Haïti.

**Philosophie:** Pas de comptabilité compliquée, juste un suivi clair de **l'argent qui entre** et **l'argent qui sort** pour prendre de meilleures décisions.

---

## 🎯 Objectif Principal

Vous permettre de répondre rapidement à ces questions:

✅ **Combien d'argent entre ce mois?**
✅ **Combien d'argent sort ce mois?**
✅ **Où va l'argent?** (salaires, médicaments, loyer, etc.)
✅ **D'où vient l'argent?** (consultations, pharmacie, examens, etc.)
✅ **Ai-je assez de cash pour investir?**
✅ **Quelle clinique est la plus rentable?**

---

## 👥 Les 3 Rôles

### 1. 👤 Manager (Gestionnaire de Clinique)
**Accès:** SEULEMENT les dettes actives de sa clinique

**Peut faire:**
- Voir les alertes de rapports manquants
- Entrer un rapport journalier avec:
  - Revenus (consultations, pharmacie, examens, autres)
  - **Dépenses avec TYPE obligatoire** (salaires, loyer, médicaments, etc.)
- Voir les dettes actives (patients qui doivent)
- Enregistrer paiements de dettes

**Ne peut PAS:**
- Voir les montants totaux de revenus
- Voir les rapports historiques
- Voir les caisses
- Accéder aux rapports cash-flow

---

### 2. 👨‍💼 Superuser (Superviseur)
**Accès:** TOUT en lecture + rapports + gestion dettes entreprise

**Peut faire:**
- Voir dashboard cash-flow complet
- Générer rapports mensuels
- Voir calendrier des rapports
- Entrer rapports journaliers
- Marquer managers "OFF" sur alertes
- Gérer dettes entreprise (fournisseurs)
- Enregistrer apports/prélèvements propriétaire
- Voir graphiques et statistiques
- Filtrer par période et clinique

**Ne peut PAS:**
- Créer/modifier utilisateurs
- Supprimer données
- Accéder admin Django

---

### 3. 👑 Grand Superuser (Administrateur)
**Accès:** TOUT sans restriction

**Peut faire:** Tout ce que Superuser + 
- Créer/modifier/supprimer utilisateurs
- Gérer apports de capital
- Fusionner rapports multiples
- Accéder admin Django
- Ajouter nouveaux codes de comptes
- Configuration système

---

## 💰 Codes de Comptes (Simple)

### Entrées d'Argent (Revenus)
```
REV_CONSULTATION    → Revenus consultations
REV_PHARMACIE       → Revenus pharmacie
REV_EXAMEN          → Revenus examens/analyses
REV_INJECTION       → Revenus injections
REV_SUTURE          → Revenus sutures
REV_PANSEMENT       → Revenus pansements
REV_AUTRE           → Autres revenus services
REC_DETTE           → Recouvrement dettes patients
APPORT_PROPRIO      → Apport du propriétaire
```

### Sorties d'Argent (Dépenses)
```
ACH_MEDICAMENT      → Achats médicaments
ACH_MATERIEL        → Achats matériel médical
SAL_MEDECIN         → Salaires médecins
SAL_INFIRMIER       → Salaires infirmiers
SAL_ADMIN           → Salaires administratif
LOY_LOYER           → Loyer du local
ELE_ELECTRICITE     → Facture électricité
EAU_EAU             → Facture eau
TEL_TELEPHONE       → Téléphone/Internet
TRA_TRANSPORT       → Frais de transport
ENT_ENTRETIEN       → Entretien/Réparation
PUB_PUBLICITE       → Publicité/Marketing
FRN_FOURNISSEUR     → Paiement fournisseurs
PRELEVEMENT_PROPRIO → Prélèvement propriétaire
DEP_AUTRE           → Autres dépenses
```

**➕ Vous pouvez ajouter de nouveaux codes à tout moment!**

---

## 📊 Rapport Mensuel Exemple

```
═══════════════════════════════════════════════════════
   RAPPORT CASH-FLOW - Mai 2026
   Clinique: Port-au-Prince
═══════════════════════════════════════════════════════

📈 ENTRÉES D'ARGENT               1,800,000 HTG

Par source:
  Consultations         450,000 HTG  (25%)
  Pharmacie             750,000 HTG  (42%)
  Examens               300,000 HTG  (17%)
  Injections/Sutures    120,000 HTG  (7%)
  Recouvrement dettes   180,000 HTG  (10%)

📉 SORTIES D'ARGENT               1,100,000 HTG

Par catégorie:
  ACHATS                450,000 HTG  (41%)
    - Médicaments       380,000
    - Matériel           70,000
  
  SALAIRES              400,000 HTG  (36%)
    - Médecins          200,000
    - Infirmiers        120,000
    - Administratif      80,000
  
  CHARGES FIXES         150,000 HTG  (14%)
    - Loyer              80,000
    - Électricité        40,000
    - Eau/Téléphone      30,000
  
  CHARGES VARIABLES      80,000 HTG  (7%)
    - Transport          50,000
    - Entretien          30,000

═══════════════════════════════════════════════════════
💰 CASH-FLOW NET                   700,000 HTG
═══════════════════════════════════════════════════════

📊 ANALYSE:
  ✅ Marge: 38.9% (Excellent)
  ✅ Plus grosse entrée: Pharmacie (750,000)
  ⚠️  Plus grosse sortie: Achats médicaments (380,000)

💡 DÉCISION:
  Vous avez 700,000 HTG de cash positif ce mois.
  → Possibilité d'acheter nouvel équipement
  → Ou constituer réserve de sécurité
```

---

## 🗂️ Structure des Documents

| # | Document | Description |
|---|----------|-------------|
| 00 | **LISEZ-MOI-EN-PREMIER.md** | Ce document - Vue d'ensemble |
| 01 | **GUIDE-INSTALLATION.md** | Installation pas à pas (2-3h) |
| 02 | **MODELES-DJANGO.md** | Tous les modèles de base de données |
| 03 | **API-REST.md** | Endpoints API complets |
| 04 | **INTERFACE-REACT.md** | Composants frontend |
| 05 | **DEPLOIEMENT.md** | Mise en production gratuite |
| 06 | **GUIDE-UTILISATEUR.md** | Manuel pour managers et superusers |

---

## 🚀 Démarrage Rapide

### Option 1: Installation Guidée (Recommandé)
Je vais vous accompagner étape par étape:

1. **Lire ce document** (5 min)
2. **Ouvrir `01-GUIDE-INSTALLATION.md`** (15 min lecture)
3. **Suivre les étapes d'installation** (2-3h)
4. **Tester avec données de démo** (30 min)
5. **Déploiement** (1h)

**Total: 1 journée pour avoir le système fonctionnel**

### Option 2: Installation Automatique (Avancé)
Si vous êtes développeur:
```bash
# Backend
cd vidmed-backend
python setup_auto.py

# Frontend  
cd vidmed-frontend
npm run setup
```

---

## 📦 Fonctionnalités Principales

### ✅ Pour le Manager
- Interface ultra-simple (2 sections)
- Entrée de rapport avec sélection TYPE de dépense
- Gestion dettes actives

### ✅ Pour le Superuser
- Dashboard cash-flow complet
- Graphiques visuels (barres, camemberts)
- Filtres par période/clinique
- Gestion dettes entreprise
- Apports/Prélèvements propriétaire
- Génération rapports PDF (futur)

### ✅ Automatique
- Génération automatique des transactions
- Calculs automatiques
- Alertes si rapport manquant (8pm)
- Réconciliation caisse/rapports

---

## 💻 Technologies Utilisées

**Backend:**
- Django 5.0 (Python)
- MySQL 8.0
- Django REST Framework (API)
- JWT Authentication

**Frontend:**
- React 18 (TypeScript)
- Material-UI v5
- Chart.js (graphiques)
- Axios (HTTP)

**Infrastructure:**
- Render (backend gratuit)
- Vercel (frontend gratuit)
- Google Drive (backup gratuit 15GB)

**Coût:** 0€/mois 🎉

---

## 📊 Base de Données (12 Tables)

1. **Users** - Utilisateurs (3 rôles)
2. **Clinics** - Cliniques
3. **AccountCodes** - Codes de comptes
4. **DailyReports** - Rapports journaliers
5. **Expenses** - Dépenses (avec code compte)
6. **Debts** - Dettes patients
7. **DebtPayments** - Paiements dettes
8. **CompanyDebts** - Dettes entreprise
9. **OwnerTransactions** - Apports/Prélèvements
10. **CashFlowTransactions** - Toutes transactions (auto)
11. **Alerts** - Alertes rapports manquants
12. **ClinicOffDays** - Jours de congé

---

## 🎯 Prochaines Étapes

1. ✅ **Lire ce document** (vous êtes ici)
2. ➡️ **Ouvrir `01-GUIDE-INSTALLATION.md`**
3. ➡️ Installer prérequis (Python, MySQL, Node.js)
4. ➡️ Configurer backend Django
5. ➡️ Configurer frontend React
6. ➡️ Tester en local
7. ➡️ Déployer en production

---

## 📞 Support

**Je vous accompagne jusqu'au déploiement complet!**

À chaque étape, je vais:
- ✅ Créer tous les fichiers nécessaires
- ✅ Expliquer chaque commande
- ✅ Déboguer les erreurs
- ✅ Tester avec vous
- ✅ Déployer en production

**Prêt à commencer?** 🚀

Ouvrez le fichier `01-GUIDE-INSTALLATION.md` et suivez les instructions.

---

**Version:** 2.0 (Système Cash-Flow Simplifié)  
**Date:** 1er juin 2026  
**Auteur:** Claude (Assistant IA)  
**Pour:** Jean Suzan Marc  
**Projet:** VIDMED - Gestion Cliniques Haïti

**🎉 Bonne chance! Je suis avec vous tout au long du processus.**
