# 🎮 Guild Master CLI

[![English](https://img.shields.io/badge/lang-English-red.svg)](README.md)

Un jeu RPG de gestion de guilde qui s'exécute entièrement dans votre terminal. Construisez votre guilde, recrutez des aventuriers, accomplissez des missions et affrontez des guildes rivales contrôlées par l'IA !

## 📋 Fonctionnalités

- ✅ **Gestion de Guilde** - Gérez l'or, la réputation et les aventuriers
- ✅ **Système d'Aventuriers** - 6 classes avec stats et personnalités uniques
- ✅ **Système de Missions** - Missions dynamiques avec difficulté et tags
- ✅ **Simulation de Combat** - Combat par phases avec blessures et morts
- ✅ **Traits de Personnalité** - Les aventuriers fuient, protègent ou volent selon leur personnalité
- ✅ **IA Rivales** - Affrontez 3 guildes contrôlées par l'IA
- ✅ **Sauvegarde/Chargement** - Parties persistantes
- ✅ **Localisation** - Support complet français et anglais
- ✅ **Multi-Plateforme** - Builds pour Windows, macOS et Linux

## 🚀 Installation

### Démarrage Rapide (Node.js)
```bash
cd guild-master-cli
npm install
npm start
```

### Compiler des Exécutables
```bash
npm run build        # Compiler pour la plateforme actuelle
npm run build:all    # Compiler pour toutes les plateformes
```

## 🎯 Comment Jouer

1. **Sélectionner la Langue** - Choisissez français ou anglais au démarrage
2. **Gérer Votre Guilde** - Consultez les stats, aventuriers et inventaire
3. **Recruter des Aventuriers** - Engagez de nouveaux membres à la taverne
4. **Accepter des Missions** - Choisissez selon la difficulté et les récompenses
5. **Constituer Votre Équipe** - Sélectionnez des aventuriers avec des bonus de classe
6. **Accomplir les Missions** - Regardez votre équipe affronter les phases de combat
7. **Gagner la Partie** - Atteignez le niveau moyen cible avant les rivaux !

## 📦 Structure du Projet

```
guild-master-cli/
├── index.js                    # Point d'entrée principal
├── package.json                # Dépendances
├── saves/                      # Fichiers de sauvegarde
└── src/
    ├── core/
    │   ├── config.js           # Chargeur de configuration
    │   └── game.js             # Gestionnaire de jeu
    ├── models/
    │   ├── adventurer.js       # Classe Aventurier
    │   ├── enums.js            # Énumérations du jeu
    │   ├── guild.js            # Classe Guilde
    │   ├── item.js             # Système d'items
    │   └── mission.js          # Classe Mission
    ├── systems/
    │   ├── ia-controller.js    # Contrôleur IA des guildes
    │   ├── persistence.js      # Système de sauvegarde
    │   ├── random.js           # Génération aléatoire
    │   └── simulation.js       # Simulation de missions
    ├── ui/
    │   ├── components.js       # Composants UI
    │   ├── prompts.js          # Prompts interactifs
    │   └── theme.js            # Couleurs et styles
    └── i18n/
        ├── index.js            # Système de traduction
        ├── en.json             # Traductions anglaises
        └── fr.json             # Traductions françaises
```

## 🎨 Mécaniques de Jeu

### Classes
| Classe | Forces | Meilleurs Tags |
|--------|--------|----------------|
| **Guerrier** | ATK élevée | Combat, Boss |
| **Mage** | Dégâts magiques | Magie, Élémentaire, Non-Morts |
| **Voleur** | Vitesse, Critique | Pièges, Furtivité, Embuscade |
| **Tank** | Défense | Combat, Boss, Embuscade |
| **Prêtre** | Soin, Endurance | Longue Mission, Non-Morts |
| **Villageois** | Aucune | - |

### Personnalités
| Personnalité | Comportement |
|--------------|--------------|
| **Courageux** | Comportement standard |
| **Lâche** | Peut fuir quand les PV sont bas |
| **Cupide** | Peut voler le butin rare |
| **Loyal** | Protège les alliés blessés |
| **Héroïque** | Peut se sacrifier pour sauver l'équipe |
| **Opportuniste** | Fuit quand l'équipe perd |

### Synergie d'Équipe
- **+5%** par classe unique dans l'équipe
- **+15%** bonus pour équipe équilibrée (Tank + Healer + DPS)

## 🛠️ Dépendances

- [inquirer](https://www.npmjs.com/package/inquirer) - Prompts interactifs
- [chalk](https://www.npmjs.com/package/chalk) - Couleurs terminal
- [boxen](https://www.npmjs.com/package/boxen) - Dessin de boîtes
- [figlet](https://www.npmjs.com/package/figlet) - Art ASCII
- [gradient-string](https://www.npmjs.com/package/gradient-string) - Dégradés de couleurs
- [ora](https://www.npmjs.com/package/ora) - Spinners
- [caxa](https://www.npmjs.com/package/caxa) - Packaging d'exécutables

## 📝 Licence

MIT License
