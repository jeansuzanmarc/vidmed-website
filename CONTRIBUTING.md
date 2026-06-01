# Guide de Contribution à VIDMED v2.0

Merci de votre intérêt pour contribuer à VIDMED! Ce document explique comment participer au développement du projet.

## 🤝 Code de Conduite

En participant à ce projet, vous vous engagez à respecter un environnement respectueux et inclusif pour tous.

## 🚀 Comment Contribuer

### 1. Fork et Clone

```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/VOTRE-USERNAME/Vidmed_cashflow.git
cd Vidmed_cashflow
```

### 2. Créer une Branche

```bash
# Créez une branche pour votre fonctionnalité ou correction
git checkout -b feature/ma-nouvelle-fonctionnalite
# ou
git checkout -b fix/correction-bug
```

### 3. Faire vos Modifications

#### Backend (Django)

```bash
cd vidmed-backend

# Installer les dépendances
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Créer vos migrations si nécessaire
python manage.py makemigrations
python manage.py migrate

# Tester vos modifications
python test_backend.py
```

#### Frontend (React)

```bash
cd vidmed-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Tester vos modifications
npm run lint
npm run type-check
```

### 4. Suivre les Standards de Code

#### Python (Backend)

- **PEP 8**: Suivre les conventions Python
- **Type Hints**: Utiliser les annotations de type
- **Docstrings**: Documenter les fonctions et classes
- **Tests**: Ajouter des tests pour les nouvelles fonctionnalités

```python
# Exemple de code conforme
def calculate_revenue(
    consultation: Decimal,
    medicines: Decimal
) -> Decimal:
    """
    Calcule le revenu total.
    
    Args:
        consultation: Revenu des consultations
        medicines: Revenu des médicaments
    
    Returns:
        Decimal: Revenu total
    """
    return consultation + medicines
```

#### TypeScript (Frontend)

- **ESLint**: Respecter les règles ESLint configurées
- **TypeScript**: Typer toutes les variables et fonctions
- **React Hooks**: Utiliser les hooks React correctement
- **Components**: Créer des composants réutilisables

```typescript
// Exemple de composant conforme
interface Props {
  title: string;
  amount: number;
}

export const StatCard: React.FC<Props> = ({ title, amount }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="h6">{formatCurrency(amount)}</Typography>
      </CardContent>
    </Card>
  );
};
```

### 5. Commit vos Modifications

Utilisez des messages de commit clairs et descriptifs:

```bash
git add .
git commit -m "feat: Ajout de la fonctionnalité X

- Implémentation de X dans Y
- Tests ajoutés pour Z
- Documentation mise à jour"
```

**Format des messages de commit:**

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Modification de documentation
- `style:` Changements de style (formatting, etc.)
- `refactor:` Refactorisation du code
- `test:` Ajout ou modification de tests
- `chore:` Maintenance (dépendances, config, etc.)

### 6. Push et Pull Request

```bash
# Push vers votre fork
git push origin feature/ma-nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
```

#### Checklist Pull Request

- [ ] Le code compile sans erreurs
- [ ] Les tests passent (backend et/ou frontend)
- [ ] La documentation est à jour
- [ ] Le code respecte les standards du projet
- [ ] Les commits sont clairs et bien formatés
- [ ] Aucun fichier sensible (.env, credentials, etc.) n'est inclus

#### Description Pull Request

Utilisez ce template:

```markdown
## Description
[Décrivez brièvement votre modification]

## Type de Changement
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Refactorisation
- [ ] Documentation
- [ ] Autre (précisez)

## Tests
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests manuels effectués
- [ ] Tous les tests passent

## Screenshots (si applicable)
[Ajoutez des captures d'écran si changements UI]

## Checklist
- [ ] Code suit les standards du projet
- [ ] Documentation mise à jour
- [ ] Tests passent
- [ ] Commits bien formatés
```

## 🐛 Rapporter un Bug

Utilisez les **GitHub Issues** avec le label `bug`:

**Template Bug Report:**

```markdown
**Description du Bug**
[Description claire et concise]

**Étapes pour Reproduire**
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement Attendu**
[Ce qui devrait se passer]

**Comportement Actuel**
[Ce qui se passe réellement]

**Screenshots**
[Si applicable]

**Environnement**
- OS: [ex: Windows 11]
- Navigateur: [ex: Chrome 120]
- Version Backend: [ex: v2.0]
- Version Frontend: [ex: v2.0]

**Logs/Erreurs**
```
[Coller les logs]
```
```

## ✨ Proposer une Fonctionnalité

Utilisez les **GitHub Issues** avec le label `enhancement`:

**Template Feature Request:**

```markdown
**Fonctionnalité Proposée**
[Description claire de la fonctionnalité]

**Motivation**
[Pourquoi cette fonctionnalité est-elle nécessaire?]

**Solution Proposée**
[Comment cette fonctionnalité devrait fonctionner]

**Alternatives Considérées**
[Autres approches envisagées]

**Impact**
- [ ] Backend
- [ ] Frontend
- [ ] Base de données
- [ ] Documentation
```

## 📚 Domaines de Contribution

### Backend
- Nouveaux endpoints API
- Optimisations de performance
- Tests unitaires et d'intégration
- Améliorations de sécurité
- Documentation API

### Frontend
- Nouvelles pages/composants
- Améliorations UI/UX
- Optimisations de performance
- Tests (Jest, Cypress)
- Accessibilité (a11y)

### Documentation
- Guides d'installation
- Tutoriels
- Documentation API
- Exemples de code
- Traductions

### Infrastructure
- Configuration Docker
- Scripts de déploiement
- CI/CD pipelines
- Monitoring et logging

## 🔍 Review Process

1. **Automated Checks**: Les tests automatiques doivent passer
2. **Code Review**: Un mainteneur reviewera votre code
3. **Discussions**: Répondez aux commentaires et suggestions
4. **Merge**: Une fois approuvée, votre PR sera mergée

## 📞 Besoin d'Aide?

- **GitHub Discussions**: Pour les questions générales
- **GitHub Issues**: Pour les bugs et features
- **Email**: [Votre email de contact]

## 🎉 Reconnaissance

Tous les contributeurs seront ajoutés au fichier CONTRIBUTORS.md et dans les release notes.

Merci de contribuer à VIDMED! 🏥💙

---

**© 2026 VIDMED - Système de gestion de flux de trésorerie**
