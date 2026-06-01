# 👥 Cas d'Utilisation par Rôle - VIDMED

**Scénarios réels d'utilisation quotidienne du système**

---

## 📋 Table des Matières
1. [Manager (Gestionnaire de Clinique)](#manager)
2. [Superuser (Superviseur)](#superuser)
3. [Grand Superuser (Administrateur)](#grand-superuser)
4. [Comparaison des Rôles](#comparaison)

---

# 👤 MANAGER (Gestionnaire de Clinique)

**Profil type:** Marie Pierre, gestionnaire de la clinique Port-au-Prince

## 🎯 Responsabilités Principales

1. Entrer le rapport journalier de la clinique
2. Gérer les dettes actives des patients
3. Répondre aux alertes de rapports manquants

---

## 📅 Cas d'Utilisation 1: Entrée du Rapport Journalier

### Scénario
**Date:** Lundi 2 juin 2026, 7h00 du soir  
**Lieu:** Clinique Port-au-Prince  
Marie termine sa journée et doit entrer le rapport dans le système.

### Étapes

**1. Connexion**
```
Marie ouvre: http://vidmed.com
Login: manager1
Mot de passe: manager123
```

**2. Interface Manager (2 sections seulement)**
```
┌─────────────────────────────────────────┐
│  🏥 Dashboard Manager                    │
│  Clinique: Port-au-Prince               │
└─────────────────────────────────────────┘

[Onglet 1: Alertes] [Onglet 2: Dettes]

📢 ALERTES (1)
┌──────────────────────────────────────┐
│ ⚠️ Rapport manquant: 02/06/2026     │
│ [Entrer le Rapport Maintenant]       │
└──────────────────────────────────────┘
```

**3. Clique sur "Entrer le Rapport Maintenant"**

Formulaire s'ouvre:
```
┌─────────────────────────────────────────────┐
│  📊 Rapport Journalier - 02/06/2026         │
└─────────────────────────────────────────────┘

📈 REVENUS DU JOUR
┌──────────────────────────────────────┐
│ Consultations:    [15,000] HTG      │
│ Pharmacie:        [25,000] HTG      │
│ Examens:          [10,000] HTG      │
│ Autres services:  [5,000]  HTG      │
│                                      │
│ TOTAL REVENUS: 55,000 HTG (auto)    │
└──────────────────────────────────────┘

📉 DÉPENSES DU JOUR
┌──────────────────────────────────────┐
│ ➕ Ajouter une Dépense               │
└──────────────────────────────────────┘

[Liste des dépenses ajoutées]
```

**4. Ajouter Dépense #1 - Salaire**

Clique sur "➕ Ajouter une Dépense":
```
┌────────────────────────────────────────┐
│  💰 Nouvelle Dépense                   │
└────────────────────────────────────────┘

Type de dépense: * (OBLIGATOIRE)
┌──────────────────────────────────────┐
│ [Sélectionner un type ▼]             │
│                                      │
│ 💼 SALAIRES                          │
│   SAL_MEDECIN - Salaires Médecins   │
│   SAL_INFIRMIER - Salaires Infirm.  │
│   SAL_ADMIN - Salaires Administratif │
│                                      │
│ 🛒 ACHATS                            │
│   ACH_MEDICAMENT - Achats Médic.    │
│   ACH_MATERIEL - Achats Matériel    │
│                                      │
│ 🏢 CHARGES FIXES                     │
│   LOY_LOYER - Loyer                  │
│   ELE_ELECTRICITE - Électricité      │
│   EAU_EAU - Eau                      │
│   TEL_TELEPHONE - Téléphone/Internet │
│                                      │
│ 📦 CHARGES VARIABLES                 │
│   TRA_TRANSPORT - Transport          │
│   ENT_ENTRETIEN - Entretien          │
│   PUB_PUBLICITE - Publicité          │
│                                      │
│ 💸 AUTRES                            │
│   DEP_AUTRE - Autres Dépenses        │
└──────────────────────────────────────┘

Description: [Salaire Dr. Jean Baptiste]

Montant (HTG): [12,000]

Fournisseur (optionnel): [Dr. Jean Baptiste]

N° Facture (optionnel): [     ]

[Annuler] [Enregistrer]
```

Marie sélectionne: **SAL_MEDECIN**

**5. Ajouter Dépense #2 - Électricité**

Répète le processus:
```
Type: ELE_ELECTRICITE (Électricité)
Description: Facture EDH mai 2026
Montant: 8,000 HTG
Fournisseur: EDH
N° Facture: EDH-2026-05-1234
```

**6. Ajouter Dépense #3 - Médicaments**

```
Type: ACH_MEDICAMENT (Achats Médicaments)
Description: Réapprovisionnement pharmacie
Montant: 18,000 HTG
Fournisseur: Pharma Haiti
N° Facture: PH-2026-567
```

**7. Récapitulatif Final**
```
┌─────────────────────────────────────────────┐
│  📊 Rapport Journalier - 02/06/2026         │
└─────────────────────────────────────────────┘

📈 REVENUS: 55,000 HTG
  - Consultations: 15,000
  - Pharmacie: 25,000
  - Examens: 10,000
  - Autres: 5,000

📉 DÉPENSES: 38,000 HTG
  ✓ SAL_MEDECIN: 12,000 (Salaire Dr. Jean)
  ✓ ELE_ELECTRICITE: 8,000 (Facture EDH)
  ✓ ACH_MEDICAMENT: 18,000 (Réappro pharmacie)

💰 RÉSULTAT NET: +17,000 HTG

[Annuler] [Enregistrer le Rapport]
```

**8. Marie clique "Enregistrer le Rapport"**

✅ Confirmation:
```
✅ Rapport enregistré avec succès!
✅ L'alerte a été supprimée automatiquement.

🔄 Transactions créées automatiquement:
  → REV_CONSULTATION: +15,000 HTG
  → REV_PHARMACIE: +25,000 HTG
  → REV_EXAMEN: +10,000 HTG
  → REV_AUTRE: +5,000 HTG
  → SAL_MEDECIN: -12,000 HTG
  → ELE_ELECTRICITE: -8,000 HTG
  → ACH_MEDICAMENT: -18,000 HTG
```

**⏱️ Temps total:** 5 minutes

---

## 💰 Cas d'Utilisation 2: Gérer une Dette Patient

### Scénario
**Date:** Mardi 3 juin 2026, 11h00  
Un patient, Jean Baptiste, vient payer une partie de sa dette.

### Étapes

**1. Marie va dans l'onglet "Dettes"**
```
┌─────────────────────────────────────────┐
│  💰 Dettes Actives                       │
│  Clinique: Port-au-Prince               │
└─────────────────────────────────────────┘

[Filtres: Toutes | En retard | Récentes]

┌────────────────────────────────────────────┐
│ 👤 Jean Baptiste                           │
│ 📞 +509 1111 2222                         │
│                                            │
│ Dette créée: 28/05/2026                   │
│ Montant initial: 10,000 HTG               │
│ Déjà payé: 3,000 HTG                      │
│ Restant: 7,000 HTG                        │
│                                            │
│ Status: 🟡 Partielle (30% payé)           │
│                                            │
│ [Voir Détails] [Enregistrer Paiement]    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 👤 Marie Carmel                            │
│ Dette: 5,000 HTG (Active)                  │
│ Créée: 01/06/2026                          │
│ [Détails] [Paiement]                       │
└────────────────────────────────────────────┘

Total dettes actives: 2
Montant total: 12,000 HTG
```

**2. Marie clique "Enregistrer Paiement" pour Jean Baptiste**

Formulaire:
```
┌────────────────────────────────────────┐
│  💵 Nouveau Paiement                   │
│  Patient: Jean Baptiste                │
│  Dette restante: 7,000 HTG             │
└────────────────────────────────────────┘

Montant payé aujourd'hui (HTG): [2,000]

Date du paiement: [03/06/2026]

Notes (optionnel):
[Patient a payé 2,000 HTG en espèces]

[Annuler] [Enregistrer Paiement]
```

**3. Marie enregistre**

✅ Confirmation:
```
✅ Paiement enregistré!

Détails mis à jour:
  - Nouvelle dette restante: 5,000 HTG
  - Payé à ce jour: 5,000 HTG (50%)
  - Status: 🟡 Partielle

🔄 Transaction créée automatiquement:
  → REC_DETTE: +2,000 HTG
```

**⏱️ Temps total:** 2 minutes

---

## 🚫 Ce que Marie NE PEUT PAS Faire

### ❌ Voir les Statistiques Globales
```
Marie clique sur menu "Rapports":
  → ❌ ACCÈS REFUSÉ
  "Vous n'avez pas l'autorisation."
```

### ❌ Voir les Revenus Historiques
```
Marie essaie de voir un ancien rapport:
  → ❌ ACCÈS REFUSÉ
  "Seuls les Superusers peuvent voir les rapports historiques."
```

### ❌ Gérer les Dettes Entreprise
```
Marie cherche à voir les dettes fournisseurs:
  → ❌ MENU N'EXISTE PAS dans son interface
```

### ❌ Créer/Modifier Utilisateurs
```
Marie essaie d'ajouter un utilisateur:
  → ❌ ACCÈS REFUSÉ
```

---

## 📊 Récapitulatif Manager

### ✅ Peut Faire
- Entrer rapport journalier avec **choix type dépense**
- Voir alertes rapports manquants
- Gérer dettes actives de SA clinique
- Enregistrer paiements de dettes

### ❌ Ne Peut PAS Faire
- Voir statistiques/rapports historiques
- Voir montants totaux revenus/dépenses
- Voir autres cliniques
- Gérer dettes entreprise
- Créer utilisateurs
- Accéder au cash-flow

### 🎯 Interface
**Ultra-simple:** 2 onglets seulement
1. Alertes
2. Dettes actives

---

# 👨‍💼 SUPERUSER (Superviseur)

**Profil type:** Jean Dupont, superviseur des 2 cliniques

## 🎯 Responsabilités Principales

1. Superviser les rapports des 2 cliniques
2. Générer rapports mensuels cash-flow
3. Gérer les dettes entreprise (fournisseurs)
4. Enregistrer apports/prélèvements propriétaire
5. Marquer managers "OFF" sur alertes
6. Prendre décisions basées sur les données

---

## 📊 Cas d'Utilisation 1: Générer Rapport Mensuel

### Scénario
**Date:** 1er juin 2026, 9h00  
Jean doit générer le rapport cash-flow du mois de mai pour prendre des décisions.

### Étapes

**1. Connexion**
```
Login: superuser1
Mot de passe: super123
```

**2. Interface Superuser**
```
┌─────────────────────────────────────────┐
│  🏥 Dashboard Superuser                  │
│  Bienvenue Jean Dupont                   │
└─────────────────────────────────────────┘

[Onglet 1: Cash-Flow] 
[Onglet 2: Calendrier]
[Onglet 3: Alertes]
[Onglet 4: Dettes Entreprise]
[Onglet 5: Apports/Prélèvements]
```

**3. Onglet "Cash-Flow" - Par défaut ouvert**

Filtres en haut:
```
┌────────────────────────────────────────┐
│  🔍 Filtres                             │
└────────────────────────────────────────┘

Période: [Ce mois ▼]
  Options:
  - Aujourd'hui
  - Cette semaine
  - Ce mois ✓
  - Personnalisée

Clinique: [Toutes ▼]
  Options:
  - Toutes ✓
  - Port-au-Prince
  - Cap-Haïtien

[Appliquer]
```

Jean sélectionne:
- Période: **Personnalisée** → Du 1 mai au 31 mai 2026
- Clinique: **Toutes**

**4. Rapport Cash-Flow Affiché**

```
═══════════════════════════════════════════════════════
   RAPPORT CASH-FLOW - Mai 2026
   Cliniques: Toutes
═══════════════════════════════════════════════════════

💵 CARTES RÉSUMÉ
┌─────────────┬─────────────┬─────────────┐
│ 📈 ENTRÉES  │ 📉 SORTIES  │ 💰 NET      │
│             │             │             │
│ 1,800,000   │ 1,100,000   │ 700,000     │
│ HTG         │ HTG         │ HTG         │
└─────────────┴─────────────┴─────────────┘

═══════════════════════════════════════════════════════
📈 DÉTAIL DES ENTRÉES                    1,800,000 HTG
═══════════════════════════════════════════════════════

REVENUS PAR SOURCE:

🏥 Services Médicaux                     1,620,000 HTG
┌────────────────────────────────────────────┐
│ REV_CONSULTATION  Consultations  450,000  │ ████████ 25%
│ REV_PHARMACIE     Pharmacie      750,000  │ ████████████████ 42%
│ REV_EXAMEN        Examens        300,000  │ ██████ 17%
│ REV_INJECTION     Injections      80,000  │ █ 4%
│ REV_SUTURE        Sutures         40,000  │ █ 2%
└────────────────────────────────────────────┘

💰 Recouvrement                           180,000 HTG
┌────────────────────────────────────────────┐
│ REC_DETTE  Paiements dettes      180,000  │ ████ 10%
└────────────────────────────────────────────┘

═══════════════════════════════════════════════════════
📉 DÉTAIL DES SORTIES                    1,100,000 HTG
═══════════════════════════════════════════════════════

DÉPENSES PAR CATÉGORIE:

🛒 ACHATS                                 450,000 HTG (41%)
┌────────────────────────────────────────────┐
│ ACH_MEDICAMENT   Médicaments     380,000  │
│ ACH_MATERIEL     Matériel         70,000  │
└────────────────────────────────────────────┘

💼 SALAIRES                               400,000 HTG (36%)
┌────────────────────────────────────────────┐
│ SAL_MEDECIN      Médecins        200,000  │
│ SAL_INFIRMIER    Infirmiers      120,000  │
│ SAL_ADMIN        Administratif    80,000  │
└────────────────────────────────────────────┘

🏢 CHARGES FIXES                          150,000 HTG (14%)
┌────────────────────────────────────────────┐
│ LOY_LOYER        Loyer            80,000  │
│ ELE_ELECTRICITE  Électricité      40,000  │
│ EAU_EAU          Eau               15,000  │
│ TEL_TELEPHONE    Téléphone         15,000  │
└────────────────────────────────────────────┘

📦 CHARGES VARIABLES                       80,000 HTG (7%)
┌────────────────────────────────────────────┐
│ TRA_TRANSPORT    Transport        50,000  │
│ ENT_ENTRETIEN    Entretien        30,000  │
└────────────────────────────────────────────┘

💸 AUTRES                                  20,000 HTG (2%)
┌────────────────────────────────────────────┐
│ DEP_AUTRE        Autres           20,000  │
└────────────────────────────────────────────┘

═══════════════════════════════════════════════════════
💰 RÉSULTAT NET                            700,000 HTG
═══════════════════════════════════════════════════════

📊 GRAPHIQUE CIRCULAIRE (Entrées)
    [Consultations 25% | Pharmacie 42% | Examens 17% | ...]

📊 GRAPHIQUE BARRES (Sorties)
    [Achats 41% | Salaires 36% | Charges fixes 14% | ...]

═══════════════════════════════════════════════════════
📊 ANALYSE AUTOMATIQUE
═══════════════════════════════════════════════════════

✅ Cash-Flow Net: POSITIF (+700,000 HTG)
✅ Marge de Cash-Flow: 38.9% (Excellent)

📌 Points Clés:
  • Plus grosse entrée: Pharmacie (750,000 HTG - 42%)
  • Plus grosse sortie: Achats médicaments (380,000 HTG)
  • Ratio Entrées/Sorties: 1.64 (Sain)
  
💡 RECOMMANDATIONS:

1. ✅ Cash-flow très positif ce mois
   → Possibilité d'investir dans équipement médical
   → Ou constituer réserve de sécurité (3 mois charges)

2. ⚠️  Achats médicaments = 51% des ventes pharmacie
   → Marge pharmacie acceptable (49%)
   → Surveiller si >60%

3. ✅ Salaires = 22% du chiffre d'affaires
   → Ratio sain (recommandé: 20-30%)

4. 📊 Taux recouvrement dettes: 73%
   → Bon, mais peut améliorer
   → Objectif: 80%+
```

**5. Exportation PDF**

Jean clique sur "📄 Exporter PDF":
```
✅ Rapport exporté!
   Fichier: cash_flow_mai_2026.pdf
   Taille: 2.3 MB

[Télécharger] [Envoyer par Email]
```

**⏱️ Temps total:** 3 minutes

---

## 🏢 Cas d'Utilisation 2: Gérer Dette Entreprise (Fournisseur)

### Scénario
**Date:** 5 juin 2026, 14h00  
Jean reçoit une facture de "Pharma Haiti" pour 450,000 HTG de médicaments. Il veut l'enregistrer dans le système.

### Étapes

**1. Jean va dans onglet "Dettes Entreprise"**

```
┌─────────────────────────────────────────┐
│  💼 Dettes Entreprise                    │
└─────────────────────────────────────────┘

📊 RÉSUMÉ
┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Payé     │ Restant  │ En retard│
│ 850,000  │ 320,000  │ 530,000  │ 4 dettes │
└──────────┴──────────┴──────────┴──────────┘

[➕ Nouvelle Dette Entreprise]

┌────────────────────────────────────────────┐
│ 🏪 Pharma Haiti (Fournisseur)             │
│ Dette: 280,000 HTG restants                │
│ Créée: 15/05/2026                          │
│ Échéance: 15/06/2026 (10 jours)            │
│ Priorité: 🔴 HAUTE                         │
│ [Détails] [Payer]                          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 💡 EDH (Électricité)                       │
│ Dette: 50,000 HTG                          │
│ Échéance: ⚠️ DÉPASSÉE (01/06/2026)         │
│ Priorité: 🟠 URGENTE                       │
│ [Détails] [Payer]                          │
└────────────────────────────────────────────┘
```

**2. Jean clique "➕ Nouvelle Dette Entreprise"**

Formulaire:
```
┌────────────────────────────────────────┐
│  💼 Nouvelle Dette Entreprise          │
└────────────────────────────────────────┘

Clinique: *
[Port-au-Prince ▼]

Type de dette: *
[Fournisseur ▼]
  Options:
  - Fournisseur ✓
  - Employé/Salaire
  - Banque/Prêt
  - Services publics
  - Loyer
  - Assurance
  - Impôts
  - Équipement/Matériel
  - Autre

Nom du créancier: *
[Pharma Haiti]

Téléphone:
[+509 2222 3333]

Description détaillée: * (Obligatoire)
┌────────────────────────────────────────┐
│ Facture PH-2026-789                    │
│ Réapprovisionnement médicaments:       │
│ - Antibiotiques: 200,000 HTG           │
│ - Antalgiques: 150,000 HTG             │
│ - Vitamines: 100,000 HTG               │
│ Livraison prévue: 10/06/2026           │
└────────────────────────────────────────┘

Montant total (HTG): *
[450,000]

Date de la dette: *
[05/06/2026]

Date d'échéance:
[05/07/2026] (dans 30 jours)

Priorité:
[Haute ▼]
  Options:
  - Basse
  - Moyenne
  - Haute ✓
  - Urgente

Numéro de référence:
[PH-2026-789]

Notes additionnelles:
[Conditions: Paiement sous 30 jours, 
 sinon intérêt 2% par mois]

[Annuler] [Enregistrer]
```

**3. Jean enregistre**

✅ Confirmation:
```
✅ Dette entreprise enregistrée!

Détails:
  - Créancier: Pharma Haiti
  - Montant: 450,000 HTG
  - Échéance: 05/07/2026
  - Status: 🟡 En attente

⚠️  Rappel créé pour: 28/06/2026 (7 jours avant)

🔄 Cette dette apparaîtra dans le rapport cash-flow
   quand elle sera payée.
```

**⏱️ Temps total:** 3 minutes

---

## 💰 Cas d'Utilisation 3: Apport du Propriétaire

### Scénario
**Date:** 10 juin 2026, 10h00  
Le propriétaire Jean Suzan Marc fait un apport de 300,000 HTG pour acheter un nouvel appareil de radiologie.

### Étapes

**1. Jean va dans onglet "Apports/Prélèvements"**

```
┌─────────────────────────────────────────┐
│  💰 Apports/Prélèvements Propriétaire    │
└─────────────────────────────────────────┘

📊 RÉSUMÉ
┌────────────────┬────────────────┐
│ Total Apports  │ Total Prélèv.  │
│ 800,000 HTG    │ 150,000 HTG    │
│ (3 apports)    │ (2 prélèvements)│
└────────────────┴────────────────┘

Net Propriétaire: +650,000 HTG

[➕ Nouvel Apport] [➖ Nouveau Prélèvement]

HISTORIQUE:
┌────────────────────────────────────────────┐
│ 📈 APPORT - 01/05/2026                     │
│ 500,000 HTG                                │
│ Raison: Capital initial clinique          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 📉 PRÉLÈVEMENT - 15/05/2026                │
│ 100,000 HTG                                │
│ Raison: Retrait personnel                 │
└────────────────────────────────────────────┘
```

**2. Jean clique "➕ Nouvel Apport"**

Formulaire:
```
┌────────────────────────────────────────┐
│  💰 Nouvel Apport Propriétaire         │
└────────────────────────────────────────┘

Clinique: *
[Port-au-Prince ▼]

Montant (HTG): *
[300,000]

Date: *
[10/06/2026]

Raison de l'apport: * (Détaillée)
┌────────────────────────────────────────┐
│ Achat appareil de radiologie           │
│ Marque: Siemens X-Ray 2000             │
│ Prix: 280,000 HTG                       │
│ + Frais installation: 20,000 HTG       │
│ Total: 300,000 HTG                      │
│                                         │
│ Cet équipement permettra d'offrir      │
│ service de radiologie et d'augmenter   │
│ les revenus de ~50,000 HTG/mois.       │
└────────────────────────────────────────┘

[Annuler] [Enregistrer Apport]
```

**3. Jean enregistre**

✅ Confirmation:
```
✅ Apport propriétaire enregistré!

Détails:
  - Montant: +300,000 HTG
  - Date: 10/06/2026
  - Clinique: Port-au-Prince

🔄 Transaction créée automatiquement:
  → APPORT_PROPRIO: +300,000 HTG (ENTRÉE)

📊 Impact sur cash-flow:
  - Augmente les entrées du mois de juin
  - Apparaît dans catégorie "Capitaux"

💡 Nouveau capital net propriétaire: 950,000 HTG
```

**⏱️ Temps total:** 2 minutes

---

## 🚫 Ce que Jean (Superuser) NE PEUT PAS Faire

### ❌ Créer/Modifier Utilisateurs
```
Jean essaie d'ajouter un nouveau manager:
  → ❌ ACCÈS REFUSÉ
  "Seul le Grand Superuser peut gérer les utilisateurs."
```

### ❌ Supprimer des Données
```
Jean essaie de supprimer un vieux rapport:
  → ❌ BOUTON N'EXISTE PAS
  (Seul Grand Superuser peut supprimer)
```

### ❌ Gérer les Apports de Capital (différent d'apports propriétaire)
```
Jean cherche "Apports de capital entre associés":
  → ❌ ACCÈS REFUSÉ
  (Seul Grand Superuser)
```

---

## 📊 Récapitulatif Superuser

### ✅ Peut Faire
- **Dashboard cash-flow complet**
- Générer rapports mensuels avec graphiques
- Filtrer par période/clinique
- Voir TOUS les rapports historiques
- Entrer rapports journaliers
- Marquer managers "OFF" sur alertes
- **Gérer dettes entreprise** (fournisseurs)
- **Enregistrer apports/prélèvements propriétaire**
- Voir calendrier des rapports
- Analyses et recommandations automatiques
- Exporter PDF

### ❌ Ne Peut PAS Faire
- Créer/modifier utilisateurs
- Supprimer données
- Gérer apports de capital entre associés
- Fusionner rapports multiples
- Accéder à l'admin Django
- Ajouter nouveaux codes de comptes

### 🎯 Interface
**Complète:** 5 onglets
1. Cash-Flow (principal)
2. Calendrier
3. Alertes
4. Dettes Entreprise
5. Apports/Prélèvements

---

# 👑 GRAND SUPERUSER (Administrateur)

**Profil type:** Vous (Jean Suzan Marc), propriétaire

## 🎯 Responsabilités Principales

1. Tout ce que fait Superuser
2. Gérer les utilisateurs (créer, modifier, supprimer)
3. Ajouter de nouveaux codes de comptes
4. Gérer apports de capital entre associés
5. Fusionner rapports multiples
6. Configuration système
7. Accès admin Django

---

## 👤 Cas d'Utilisation 1: Créer un Nouveau Manager

### Scénario
**Date:** 15 juin 2026  
Vous ouvrez une nouvelle clinique à Jacmel et devez créer un compte pour le nouveau manager.

### Étapes

**1. Connexion**
```
Login: admin
Mot de passe: admin123
```

**2. Menu supplémentaire visible**
```
┌─────────────────────────────────────────┐
│  👑 Dashboard Grand Superuser            │
└─────────────────────────────────────────┘

[Cash-Flow] [Calendrier] [Alertes] 
[Dettes Ent.] [Apports/Prélèv.] 
[👥 Utilisateurs] [⚙️ Configuration]
```

**3. Clic sur "👥 Utilisateurs"**

```
┌────────────────────────────────────────┐
│  👥 Gestion des Utilisateurs            │
└────────────────────────────────────────┘

[➕ Nouvel Utilisateur]

┌────────────────────────────────────────────┐
│ 👤 Marie Pierre (Manager)                 │
│ 📧 manager1@vidmed.ht                     │
│ 🏥 Clinique: Port-au-Prince                │
│ Status: ✅ Actif                           │
│ [Modifier] [Désactiver]                    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 👤 Paul Jean (Manager)                     │
│ 📧 manager2@vidmed.ht                     │
│ 🏥 Clinique: Cap-Haïtien                   │
│ Status: ✅ Actif                           │
│ [Modifier] [Désactiver]                    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 👨‍💼 Jean Dupont (Superuser)                │
│ 📧 super@vidmed.ht                        │
│ Status: ✅ Actif                           │
│ [Modifier] [Désactiver]                    │
└────────────────────────────────────────────┘
```

**4. Clic sur "➕ Nouvel Utilisateur"**

```
┌────────────────────────────────────────┐
│  👤 Créer Nouvel Utilisateur            │
└────────────────────────────────────────┘

Rôle: *
[Manager ▼]
  Options:
  - Grand Superuser
  - Superuser
  - Manager ✓

Prénom: *
[Jacques]

Nom: *
[Lefebvre]

Username: *
[manager3]

Email: *
[manager3@vidmed.ht]

Téléphone:
[+509 3333 4444]

Mot de passe: *
[••••••••] (min 8 caractères)

Confirmer mot de passe: *
[••••••••]

Clinique assignée: * (pour Manager seulement)
[Clinique Jacmel ▼]
  Options:
  - Port-au-Prince
  - Cap-Haïtien
  - Jacmel ✓ (Nouvelle)

[Annuler] [Créer Utilisateur]
```

**5. Création**

✅ Confirmation:
```
✅ Utilisateur créé avec succès!

Détails:
  - Username: manager3
  - Email: manager3@vidmed.ht
  - Rôle: Manager
  - Clinique: Jacmel
  - Status: Actif

📧 Email de bienvenue envoyé automatiquement
   avec instructions de connexion.

Credentials:
  Username: manager3
  Mot de passe temporaire: [montré une fois]
  
⚠️  L'utilisateur devra changer son mot de passe
   à la première connexion.
```

**⏱️ Temps total:** 2 minutes

---

## 💼 Cas d'Utilisation 2: Ajouter un Nouveau Code de Compte

### Scénario
**Date:** 20 juin 2026  
Vous voulez ajouter un nouveau type de dépense pour le "Carburant" (les ambulances).

### Étapes

**1. Menu "⚙️ Configuration"**

```
┌────────────────────────────────────────┐
│  ⚙️ Configuration Système               │
└────────────────────────────────────────┘

[Codes de Comptes] [Paramètres] [Backup] [Logs]
```

**2. Clic sur "Codes de Comptes"**

```
┌────────────────────────────────────────┐
│  💰 Codes de Comptes                    │
└────────────────────────────────────────┘

[➕ Nouveau Code]

🔒 COMPTES SYSTÈME (ne peuvent être supprimés)

📈 REVENUS
┌──────────────────────────────────────────┐
│ REV_CONSULTATION  Revenus Consultations │
│ REV_PHARMACIE     Revenus Pharmacie     │
│ REV_EXAMEN        Revenus Examens       │
│ ...                                      │
└──────────────────────────────────────────┘

📉 DÉPENSES
┌──────────────────────────────────────────┐
│ ACH_MEDICAMENT   Achats Médicaments     │
│ SAL_MEDECIN      Salaires Médecins      │
│ LOY_LOYER        Loyer                   │
│ ELE_ELECTRICITE  Électricité            │
│ TRA_TRANSPORT    Transport              │
│ ...                                      │
└──────────────────────────────────────────┘
```

**3. Clic sur "➕ Nouveau Code"**

```
┌────────────────────────────────────────┐
│  💰 Nouveau Code de Compte              │
└────────────────────────────────────────┘

Code: * (format: XXX_XXXXXX)
[CAR_CARBURANT]

Nom complet: *
[Carburant Ambulances]

Type de compte: *
[Dépense ▼]
  Options:
  - Trésorerie
  - Revenus
  - Dépenses ✓
  - Capitaux

Catégorie: *
[Charges variables ▼]
  Options:
  - Achats
  - Salaires
  - Charges fixes
  - Charges variables ✓
  - Dettes
  - Autres

Description:
┌────────────────────────────────────────┐
│ Achat de carburant pour les ambulances │
│ et véhicules de transport médical      │
└────────────────────────────────────────┘

Compte système: (non modifiable par utilisateurs)
[ ] Oui  [✓] Non

[Annuler] [Créer Code]
```

**4. Création**

✅ Confirmation:
```
✅ Code de compte créé!

Code: CAR_CARBURANT
Nom: Carburant Ambulances
Type: Dépense
Catégorie: Charges variables

🔄 Disponible immédiatement:
  - Les managers peuvent maintenant sélectionner
    ce code lors de l'entrée des dépenses
  - Apparaîtra dans les rapports cash-flow
    sous "Charges variables"
```

**⏱️ Temps total:** 2 minutes

---

## 📊 Cas d'Utilisation 3: Voir Logs d'Audit

### Scénario
**Date:** 25 juin 2026  
Vous voulez voir qui a accédé aux rapports financiers cette semaine.

### Étapes

**1. Menu "⚙️ Configuration" → "Logs"**

```
┌────────────────────────────────────────┐
│  📋 Logs d'Audit                        │
└────────────────────────────────────────┘

[Filtres]
Période: [Cette semaine ▼]
Utilisateur: [Tous ▼]
Action: [Toutes ▼]
  - Connexion
  - Lecture
  - Création
  - Modification
  - Suppression

[Appliquer]

RÉSULTATS: 147 actions cette semaine

┌────────────────────────────────────────────┐
│ 🟢 20/06/2026 14:23:15                     │
│ 👤 Jean Dupont (Superuser)                 │
│ 📊 Action: Lecture                         │
│ 📄 Ressource: Rapport Cash-Flow Mai 2026   │
│ 🌐 IP: 192.168.1.45                        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 🟡 20/06/2026 09:15:42                     │
│ 👤 Marie Pierre (Manager)                  │
│ 📊 Action: Création                        │
│ 📄 Ressource: Rapport Journalier          │
│ 🏥 Clinique: Port-au-Prince                │
│ 🌐 IP: 192.168.1.12                        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 🔴 19/06/2026 16:30:00                     │
│ 👤 manager1                                │
│ 📊 Action: TENTATIVE ACCÈS REFUSÉ          │
│ 📄 Ressource: Dashboard Cash-Flow          │
│ ⚠️ Raison: Permissions insuffisantes       │
│ 🌐 IP: 192.168.1.12                        │
└────────────────────────────────────────────┘

[Exporter CSV] [Générer Rapport PDF]
```

**⏱️ Temps total:** 1 minute pour consulter

---

## 📊 Récapitulatif Grand Superuser

### ✅ Peut Faire

**Tout ce que fait Superuser +**
- Créer/modifier/supprimer utilisateurs
- Ajouter/modifier codes de comptes
- Supprimer données (avec confirmation)
- Gérer apports de capital entre associés
- Fusionner rapports multiples
- Accéder logs d'audit complets
- Accéder admin Django
- Configuration système globale
- Backup et restauration

### 🎯 Interface

**Complète avec sections admin:** 7 onglets
1. Cash-Flow
2. Calendrier
3. Alertes
4. Dettes Entreprise
5. Apports/Prélèvements
6. **👥 Utilisateurs** (nouveau)
7. **⚙️ Configuration** (nouveau)

---

# 📊 COMPARAISON DES RÔLES

## Tableau Récapitulatif

| Fonctionnalité | Manager | Superuser | Grand Superuser |
|----------------|---------|-----------|-----------------|
| **Rapports Journaliers** |
| Entrer rapport | ✅ Sa clinique | ✅ Toutes | ✅ Toutes |
| Choisir type dépense | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire |
| Voir rapports historiques | ❌ | ✅ | ✅ |
| Supprimer rapport | ❌ | ❌ | ✅ |
| **Dettes Patients** |
| Voir dettes actives | ✅ Sa clinique | ✅ Toutes | ✅ Toutes |
| Enregistrer paiements | ✅ | ✅ | ✅ |
| Voir historique complet | ❌ | ✅ | ✅ |
| **Cash-Flow** |
| Dashboard cash-flow | ❌ | ✅ | ✅ |
| Générer rapports | ❌ | ✅ | ✅ |
| Filtres période/clinique | ❌ | ✅ | ✅ |
| Export PDF | ❌ | ✅ | ✅ |
| **Dettes Entreprise** |
| Voir | ❌ | ✅ | ✅ |
| Créer | ❌ | ✅ | ✅ |
| Payer | ❌ | ✅ | ✅ |
| **Apports/Prélèvements** |
| Voir | ❌ | ✅ | ✅ |
| Enregistrer | ❌ | ✅ | ✅ |
| **Utilisateurs** |
| Créer/modifier | ❌ | ❌ | ✅ |
| Supprimer | ❌ | ❌ | ✅ |
| **Configuration** |
| Codes de comptes | ❌ | ❌ | ✅ |
| Logs d'audit | ❌ | ❌ | ✅ |
| Admin Django | ❌ | ❌ | ✅ |
| Backup/Restore | ❌ | ❌ | ✅ |

---

## 🎯 Résumé en 3 Phrases

### 👤 Manager
**"Je gère MA clinique au quotidien"**
- Entrer rapport avec type de dépense
- Gérer dettes actives des patients
- Rien d'autre

### 👨‍💼 Superuser  
**"Je supervise TOUT et génère des rapports pour prendre des décisions"**
- Dashboard cash-flow complet
- Gérer dettes entreprise
- Apports/prélèvements propriétaire

### 👑 Grand Superuser
**"Je CONFIGURE le système et gère les utilisateurs"**
- Tout ce que fait Superuser
- Créer utilisateurs et codes de comptes
- Accès admin complet

---

**🎉 Voilà! Vous avez maintenant une vision complète de qui fait quoi.**

**Prêt à continuer avec l'implémentation?** 🚀

---

**Version:** 2.0  
**Date:** 1er juin 2026  
**Pages:** 25 pages de cas d'utilisation détaillés
