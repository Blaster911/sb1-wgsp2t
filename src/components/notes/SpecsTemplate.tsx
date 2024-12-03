import React from 'react';
import { Check, AlertCircle, Calendar, DollarSign, Target, Cog, Package, FileCheck, Users } from 'lucide-react';

export const specsTemplate = `# Cahier des Charges

## 1. Présentation du Projet
### 1.1 Contexte
[Décrivez le contexte et les enjeux du projet]

### 1.2 Objectifs Principaux
- [ ] Objectif 1
- [ ] Objectif 2
- [ ] Objectif 3

### 1.3 Périmètre du Projet
[Définissez clairement ce qui est inclus et exclu du projet]

## 2. Description Fonctionnelle
### 2.1 Fonctionnalités Principales
- [ ] Fonctionnalité 1
  - Description détaillée
  - Critères d'acceptation
  - Priorité: [Haute/Moyenne/Basse]

- [ ] Fonctionnalité 2
  - Description détaillée
  - Critères d'acceptation
  - Priorité: [Haute/Moyenne/Basse]

### 2.2 Fonctionnalités Secondaires
- [ ] Fonctionnalité 3
  - Description détaillée
  - Critères d'acceptation
  - Priorité: [Haute/Moyenne/Basse]

## 3. Spécifications Techniques
### 3.1 Architecture Technique
- Technologies utilisées
- Infrastructure requise
- Environnements (développement, test, production)

### 3.2 Contraintes Techniques
- Performance
  - Temps de réponse
  - Capacité de charge
- Sécurité
  - Authentification
  - Autorisation
  - Protection des données
- Compatibilité
  - Navigateurs supportés
  - Appareils supportés

## 4. Planning et Organisation
### 4.1 Phases du Projet
1. Phase 1: [Description]
   - Date début: [JJ/MM/AAAA]
   - Date fin: [JJ/MM/AAAA]
   - Livrables:
     - [ ] Livrable 1.1
     - [ ] Livrable 1.2

2. Phase 2: [Description]
   - Date début: [JJ/MM/AAAA]
   - Date fin: [JJ/MM/AAAA]
   - Livrables:
     - [ ] Livrable 2.1
     - [ ] Livrable 2.2

### 4.2 Équipe Projet
- Chef de projet:
  - Nom:
  - Contact:
- Équipe technique:
  - Développeurs:
  - Designers:
  - Testeurs:
- Intervenants externes:
  - Prestataires:
  - Fournisseurs:

## 5. Budget et Ressources
### 5.1 Budget Prévisionnel
- Développement: [Montant] €
- Design: [Montant] €
- Tests: [Montant] €
- Infrastructure: [Montant] €
- Maintenance: [Montant] €

### 5.2 Ressources Nécessaires
- Ressources humaines
- Matériel
- Logiciels
- Services externes

## 6. Critères de Réussite
### 6.1 Critères Fonctionnels
- [ ] Critère 1
- [ ] Critère 2

### 6.2 Critères Techniques
- [ ] Performance
- [ ] Sécurité
- [ ] Fiabilité

### 6.3 Critères Business
- [ ] ROI attendu
- [ ] Objectifs commerciaux
- [ ] KPIs

## 7. Modalités de Validation
### 7.1 Procédure de Recette
- Tests fonctionnels
- Tests de performance
- Tests de sécurité
- Validation utilisateur

### 7.2 Conditions d'Acceptation
- Critères de validation
- Process de validation
- Responsables validation

## 8. Maintenance et Support
### 8.1 Garantie
- Durée
- Couverture
- Conditions

### 8.2 Support
- Niveau de service (SLA)
- Procédure de support
- Contact support

## 9. Annexes
### 9.1 Documents de Référence
- [Liste des documents]

### 9.2 Glossaire
- [Termes techniques]
- [Acronymes]

### 9.3 Maquettes et Wireframes
- [Liens vers les maquettes]
- [Liens vers les wireframes]`;

interface SpecsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isCompleted: boolean;
  onClick: () => void;
}

export function SpecsSection({ icon: Icon, title, description, isCompleted, onClick }: SpecsSectionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-lg border-2 transition-all duration-200
        ${isCompleted 
          ? 'border-green-200 bg-green-50 hover:bg-green-100' 
          : 'border-gray-200 bg-white hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`
          p-2 rounded-lg
          ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {isCompleted && <Check className="w-4 h-4 text-green-500" />}
          </div>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

export const specsSections = [
  {
    id: 'presentation',
    icon: Target,
    title: 'Présentation du Projet',
    description: 'Contexte, objectifs et périmètre'
  },
  {
    id: 'functional',
    icon: Package,
    title: 'Description Fonctionnelle',
    description: 'Fonctionnalités principales et secondaires'
  },
  {
    id: 'technical',
    icon: Cog,
    title: 'Spécifications Techniques',
    description: 'Architecture, contraintes et exigences techniques'
  },
  {
    id: 'planning',
    icon: Calendar,
    title: 'Planning et Organisation',
    description: 'Phases, équipe et jalons du projet'
  },
  {
    id: 'budget',
    icon: DollarSign,
    title: 'Budget et Ressources',
    description: 'Estimation des coûts et ressources nécessaires'
  },
  {
    id: 'validation',
    icon: FileCheck,
    title: 'Critères et Validation',
    description: 'Critères de réussite et modalités de validation'
  },
  {
    id: 'support',
    icon: Users,
    title: 'Maintenance et Support',
    description: 'Garantie, support et conditions de maintenance'
  }
];