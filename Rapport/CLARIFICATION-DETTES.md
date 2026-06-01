# 💰 Clarification: Les 2 Types de Dettes

**IMPORTANT:** Il y a 2 types de dettes COMPLÈTEMENT DIFFÉRENTS dans le système.

---

## 📊 Vue d'Ensemble

```
┌────────────────────────────────────────────────────────┐
│                    VOTRE CLINIQUE                       │
└────────────────────────────────────────────────────────┘
                           │
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌───────────────┐                    ┌───────────────┐
│  💵 ARGENT    │                    │  💸 ARGENT    │
│  À RECEVOIR   │                    │  À PAYER      │
│               │                    │               │
│  DETTES       │                    │  DETTES       │
│  PATIENTS     │                    │  ENTREPRISE   │
│               │                    │               │
│  (Créances)   │                    │  (Passif)     │
└───────────────┘                    └───────────────┘
```

---

## 💵 TYPE 1: DETTES PATIENTS (Ce qu'on DOIT RECEVOIR)

### Définition
**Argent que LES PATIENTS doivent À LA CLINIQUE**

C'est une **CRÉANCE** = Argent à recevoir dans le futur

### Exemples Concrets

**Exemple 1:**
```
📅 Date: 15 mai 2026
👤 Patient: Jean Baptiste
💊 Service: Consultation + médicaments

Montant total: 5,000 HTG
Patient n'a que: 2,000 HTG aujourd'hui

➡️ DETTE PATIENT créée:
   - Montant original: 5,000 HTG
   - Paiement initial: 2,000 HTG
   - Restant dû: 3,000 HTG
   
⏰ Le patient promet de payer les 3,000 HTG dans 1 semaine
```

**Exemple 2:**
```
📅 Date: 20 mai 2026
👤 Patient: Marie Carmel
💉 Service: Examen sanguin

Montant: 8,000 HTG
Patient n'a rien aujourd'hui: 0 HTG

➡️ DETTE PATIENT créée:
   - Montant original: 8,000 HTG
   - Paiement initial: 0 HTG
   - Restant dû: 8,000 HTG
```

### Gestion dans le Système

**Table:** `Debts` (Dettes patients)

**Géré par:** Manager de la clinique

**Champs principaux:**
```python
- debtor_name: "Jean Baptiste" (nom du patient)
- debtor_phone: "+509 1111 2222"
- original_amount: 5,000 HTG
- initial_payment: 2,000 HTG (payé le jour même)
- remaining_amount: 3,000 HTG (calcul auto)
- status: 'active' (ou 'paid' quand tout payé)
```

**Paiements:**
```python
DebtPayment (Table des paiements)
- debt: lien vers la dette
- amount: 1,500 HTG (par exemple)
- payment_date: 22/05/2026
```

### Impact Cash-Flow

**Quand dette créée:** Aucune transaction (pas d'argent reçu)

**Quand paiement reçu:**
```
📈 ENTRÉE D'ARGENT (Transaction automatique)
Code: REC_DETTE (Recouvrement Dettes)
Montant: +1,500 HTG
Description: "Paiement dette Jean Baptiste"
```

### Qui Gère?

**Manager:** ✅ Peut voir et gérer les dettes actives de SA clinique
- Créer dette quand patient ne peut pas payer
- Enregistrer paiements quand patient revient payer

**Superuser:** ✅ Peut voir toutes les dettes (lecture + analyse)
- Voir statistiques de recouvrement
- Analyser les dettes en retard

**Grand Superuser:** ✅ Accès complet
- Tout ce que fait Superuser
- Peut supprimer/modifier

---

## 💸 TYPE 2: DETTES ENTREPRISE (Ce qu'on DOIT PAYER)

### Définition
**Argent que LA CLINIQUE doit À DES TIERS** (fournisseurs, employés, banques, etc.)

C'est un **PASSIF** = Argent à payer dans le futur

### Exemples Concrets

**Exemple 1: Fournisseur de Médicaments**
```
📅 Date: 10 mai 2026
🏪 Fournisseur: Pharma Haiti
📦 Achat: Réapprovisionnement médicaments

Montant facture: 450,000 HTG
Conditions: Paiement sous 30 jours

➡️ DETTE ENTREPRISE créée:
   - Créancier: Pharma Haiti
   - Type: Fournisseur
   - Montant: 450,000 HTG
   - Échéance: 10 juin 2026
   - Description: "Facture PH-2026-789
                   Antibiotiques, antalgiques, vitamines"
```

**Exemple 2: Salaire Employé**
```
📅 Date: 31 mai 2026
👨‍⚕️ Employé: Dr. Jean Baptiste
💼 Type: Salaire du mois

Montant: 50,000 HTG
À payer: 5 juin 2026

➡️ DETTE ENTREPRISE créée:
   - Créancier: Dr. Jean Baptiste
   - Type: Employé/Salaire
   - Montant: 50,000 HTG
   - Échéance: 05 juin 2026
   - Priorité: Haute
```

**Exemple 3: Facture Électricité**
```
📅 Date: 1er juin 2026
⚡ Service: EDH (Électricité d'Haïti)
📄 Facture: Mai 2026

Montant: 35,000 HTG
Échéance: 15 juin 2026

➡️ DETTE ENTREPRISE créée:
   - Créancier: EDH
   - Type: Services publics
   - Montant: 35,000 HTG
   - Échéance: 15 juin 2026
   - Priorité: Urgente (si retard = coupure)
```

**Exemple 4: Prêt Bancaire**
```
📅 Date: 1er janvier 2026
🏦 Banque: BNC (Banque Nationale de Crédit)
💰 Prêt: Achat équipement médical

Montant total: 500,000 HTG
Mensualité: 50,000 HTG/mois
Durée: 10 mois

➡️ DETTE ENTREPRISE créée chaque mois:
   - Créancier: BNC
   - Type: Banque/Prêt
   - Montant: 50,000 HTG
   - Échéance: 5 de chaque mois
```

### Gestion dans le Système

**Table:** `CompanyDebts` (Dettes entreprise)

**Géré par:** Superuser uniquement (pas les managers)

**Champs principaux:**
```python
- creditor_name: "Pharma Haiti" (le créancier)
- debt_type: 'supplier' (ou employee, bank, utilities, etc.)
- description: "Facture PH-2026-789..." (détaillé)
- original_amount: 450,000 HTG
- paid_amount: 0 HTG (au départ)
- remaining_amount: 450,000 HTG
- debt_date: 10/05/2026
- due_date: 10/06/2026
- status: 'pending' (ou 'partial', 'paid')
- priority: 'high' (ou low, medium, urgent)
```

**9 Types de dettes entreprise:**
1. **supplier** - Fournisseur (médicaments, matériel)
2. **employee** - Employé/Salaire
3. **bank** - Banque/Prêt
4. **utilities** - Services publics (EDH, DINEPA)
5. **rent** - Loyer du local
6. **insurance** - Assurance
7. **taxes** - Impôts
8. **equipment** - Équipement/Matériel
9. **other** - Autre

**Paiements:**
```python
CompanyDebtPayment (Table des paiements)
- company_debt: lien vers la dette
- amount: 150,000 HTG (paiement partiel)
- payment_date: 25/05/2026
- payment_method: 'bank_transfer' (ou cash, check, mobile_money)
```

### Impact Cash-Flow

**Quand dette créée:** Aucune transaction (pas encore payé)

**Quand paiement effectué:**
```
📉 SORTIE D'ARGENT (Transaction automatique)
Code: FRN_FOURNISSEUR (Paiement Fournisseurs)
Montant: -150,000 HTG
Description: "Paiement Pharma Haiti - Facture PH-2026-789"
```

### Qui Gère?

**Manager:** ❌ N'a AUCUN accès aux dettes entreprise
- Ne peut même pas les voir
- C'est une info stratégique réservée aux dirigeants

**Superuser:** ✅ Gestion complète
- Créer nouvelles dettes entreprise
- Enregistrer paiements
- Voir statistiques (total dû, en retard, etc.)

**Grand Superuser:** ✅ Accès complet
- Tout ce que fait Superuser
- Peut supprimer/modifier

---

## 📊 Comparaison Côte à Côte

| Aspect | DETTES PATIENTS | DETTES ENTREPRISE |
|--------|-----------------|-------------------|
| **Définition** | Argent À RECEVOIR | Argent À PAYER |
| **Nature** | Créance (actif) | Passif |
| **Qui doit?** | Les PATIENTS | LA CLINIQUE |
| **À qui?** | À LA CLINIQUE | AUX FOURNISSEURS/AUTRES |
| **Table** | `Debts` | `CompanyDebts` |
| **Gestion** | Manager | Superuser seulement |
| **Impact cash-flow** | ENTRÉE (+) quand payé | SORTIE (-) quand payé |
| **Code transaction** | REC_DETTE (+) | FRN_FOURNISSEUR (-) |
| **Exemple** | Patient Jean: 5,000 HTG | Pharma Haiti: 450,000 HTG |

---

## 💡 Exemples dans le Rapport Cash-Flow

### Rapport Mai 2026

```
═══════════════════════════════════════════════════════
   RAPPORT CASH-FLOW - Mai 2026
═══════════════════════════════════════════════════════

📈 ENTRÉES D'ARGENT                     1,800,000 HTG
───────────────────────────────────────────────────────
Services médicaux:
  REV_CONSULTATION                        450,000
  REV_PHARMACIE                           750,000
  REV_EXAMEN                              300,000
  Autres                                  120,000
  
💰 Recouvrement dettes patients:
  REC_DETTE                               180,000  ← DETTES PATIENTS PAYÉES
  
📉 SORTIES D'ARGENT                     1,100,000 HTG
───────────────────────────────────────────────────────
Achats:
  ACH_MEDICAMENT                          380,000
  ACH_MATERIEL                             70,000
  
Salaires:
  SAL_MEDECIN                             200,000
  SAL_INFIRMIER                           120,000
  SAL_ADMIN                                80,000
  
Charges fixes:
  LOY_LOYER                                80,000
  ELE_ELECTRICITE                          40,000
  EAU_EAU                                  15,000
  TEL_TELEPHONE                            15,000
  
Charges variables:
  TRA_TRANSPORT                            50,000
  ENT_ENTRETIEN                            30,000
  
💸 Paiement dettes entreprise:
  FRN_FOURNISSEUR                          20,000  ← DETTES ENTREPRISE PAYÉES
                                                     (Acompte Pharma Haiti)

═══════════════════════════════════════════════════════
💰 CASH-FLOW NET                          700,000 HTG
═══════════════════════════════════════════════════════
```

**Lecture du rapport:**
- ✅ On a reçu 180,000 HTG de paiements de dettes patients (REC_DETTE)
- ✅ On a payé 20,000 HTG de dettes entreprise (FRN_FOURNISSEUR)

---

## 🎯 Tableau de Bord Superuser - Section Dettes

Le Superuser voit **2 sections distinctes:**

### Section 1: Dettes Patients (Consultation)
```
┌─────────────────────────────────────────┐
│  💵 DETTES PATIENTS (Argent à recevoir)  │
└─────────────────────────────────────────┘

📊 RÉSUMÉ
Total à recevoir: 250,000 HTG
Nombre de dettes: 15
Taux recouvrement: 73%

[Voir Détails] (liste en lecture seule)
```

### Section 2: Dettes Entreprise (Gestion)
```
┌─────────────────────────────────────────┐
│  💸 DETTES ENTREPRISE (Argent à payer)   │
└─────────────────────────────────────────┘

📊 RÉSUMÉ
Total à payer: 850,000 HTG
Dont en retard: 80,000 HTG (4 dettes)
Priorité urgente: 120,000 HTG

[➕ Nouvelle Dette Entreprise]
[Voir Toutes les Dettes]

DETTES URGENTES:
┌────────────────────────────────────────────┐
│ ⚡ EDH - Électricité                       │
│ 50,000 HTG - ÉCHÉANCE DÉPASSÉE            │
│ [Payer Maintenant]                         │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 🏪 Pharma Haiti - Fournisseur             │
│ 430,000 HTG restants                       │
│ Échéance: 10/06/2026 (5 jours)            │
│ [Enregistrer Paiement]                     │
└────────────────────────────────────────────┘
```

---

## 🔄 Flux de Vie Complet

### Dettes Patients (Exemple)

```
📅 Jour 1 (15/05/2026):
  👤 Patient Jean Baptiste
  💊 Service: 5,000 HTG
  💵 Paie: 2,000 HTG
  
  ➡️ Système crée:
     • DailyReport: +5,000 HTG (revenu)
     • CashFlowTransaction: REV_CONSULTATION +5,000
     • Debt: 3,000 HTG restants (dette patient)
     
  📊 Cash-flow: +2,000 HTG (argent reçu aujourd'hui)
  📋 Dette: 3,000 HTG (à recevoir plus tard)

📅 Jour 8 (22/05/2026):
  👤 Patient revient
  💵 Paie: 1,500 HTG
  
  ➡️ Système crée:
     • DebtPayment: 1,500 HTG
     • CashFlowTransaction: REC_DETTE +1,500
     
  📊 Cash-flow: +1,500 HTG
  📋 Dette restante: 1,500 HTG

📅 Jour 15 (29/05/2026):
  👤 Patient revient
  💵 Paie: 1,500 HTG (solde final)
  
  ➡️ Système:
     • DebtPayment: 1,500 HTG
     • CashFlowTransaction: REC_DETTE +1,500
     • Debt.status → 'paid' (automatique)
     
  📊 Cash-flow: +1,500 HTG
  ✅ Dette soldée!
```

### Dettes Entreprise (Exemple)

```
📅 Jour 1 (10/05/2026):
  🏪 Facture: Pharma Haiti
  📄 Montant: 450,000 HTG
  ⏰ Échéance: 30 jours
  
  ➡️ Superuser crée:
     • CompanyDebt: 450,000 HTG
     • Type: Fournisseur
     • Priorité: Haute
     
  📊 Cash-flow: 0 (pas encore payé)
  ⚠️  Obligation future: -450,000 HTG

📅 Jour 15 (25/05/2026):
  💰 Paiement partiel: 150,000 HTG
  
  ➡️ Superuser enregistre:
     • CompanyDebtPayment: 150,000 HTG
     • CashFlowTransaction: FRN_FOURNISSEUR -150,000
     • CompanyDebt.paid_amount → 150,000
     • CompanyDebt.remaining → 300,000
     • CompanyDebt.status → 'partial'
     
  📊 Cash-flow: -150,000 HTG
  📋 Dette restante: 300,000 HTG

📅 Jour 40 (10/06/2026):
  💰 Paiement final: 300,000 HTG
  
  ➡️ Superuser enregistre:
     • CompanyDebtPayment: 300,000 HTG
     • CashFlowTransaction: FRN_FOURNISSEUR -300,000
     • CompanyDebt.status → 'paid' (automatique)
     
  📊 Cash-flow: -300,000 HTG
  ✅ Dette soldée!
```

---

## ✅ Points Clés à Retenir

### DETTES PATIENTS ✅
- ✅ C'est de l'argent que les PATIENTS vous doivent
- ✅ C'est POSITIF pour vous (argent à recevoir)
- ✅ Géré par les MANAGERS
- ✅ Quand payé → ENTRÉE d'argent (+)
- ✅ Code: REC_DETTE

### DETTES ENTREPRISE ✅
- ✅ C'est de l'argent que VOUS devez aux fournisseurs/autres
- ✅ C'est NÉGATIF pour vous (argent à payer)
- ✅ Géré par les SUPERUSERS uniquement
- ✅ Quand payé → SORTIE d'argent (-)
- ✅ Code: FRN_FOURNISSEUR

### JAMAIS Confondre! ⚠️
- ❌ Les managers ne voient PAS les dettes entreprise
- ❌ Les dettes patients ne sont PAS dans le même menu
- ✅ 2 tables séparées: `Debts` et `CompanyDebts`
- ✅ 2 codes différents: `REC_DETTE` et `FRN_FOURNISSEUR`

---

**Est-ce maintenant 100% clair?** 🎯

Dites-moi si vous voulez que je clarifie autre chose avant de continuer avec l'implémentation!

---

**Version:** 2.0  
**Date:** 1er juin 2026  
**Pages:** 12 pages de clarification complète
