# 🎮 Guild Master CLI

[![Français](https://img.shields.io/badge/lang-Français-blue.svg)](README_FR.md)

A guild management RPG game that runs entirely in your terminal. Build your guild, recruit adventurers, complete missions, and compete against AI-controlled rival guilds!

## 📋 Features

- ✅ **Guild Management** - Manage gold, reputation, and adventurers
- ✅ **Adventurer System** - 6 classes with unique stats and personalities
- ✅ **Mission System** - Dynamic missions with difficulty ratings and tags
- ✅ **Combat Simulation** - Phase-based combat with injuries and deaths
- ✅ **Personality Traits** - Adventurers flee, protect allies, or steal loot based on personality
- ✅ **AI Rivals** - Compete against 3 AI-controlled guilds
- ✅ **Save/Load** - Persistent game saves
- ✅ **Localization** - Full English and French support
- ✅ **Cross-Platform** - Builds for Windows, macOS, and Linux

## 🚀 Installation

### Quick Start (Node.js)
```bash
cd guild-master-cli
npm install
npm start
```

### Build Standalone Executables
```bash
npm run build:win      # Build for windows
npm run build:mac      # Build for mac  
```

## 🎯 How to Play

1. **Select Language** - Choose English or French at startup
2. **Manage Your Guild** - View stats, adventurers, and inventory
3. **Recruit Adventurers** - Hire new members at the tavern
4. **Accept Missions** - Choose missions based on difficulty and rewards
5. **Build Your Team** - Select adventurers with class bonuses for mission tags
6. **Complete Missions** - Watch your team face phases of combat
7. **Win the Game** - Reach the target average level before rivals!

## 📦 Project Structure

```
guild-master-cli/
├── index.js                    # Main entry point
├── package.json                # Dependencies
├── saves/                      # Save game files
└── src/
    ├── core/
    │   ├── config.js           # Configuration loader
    │   └── game.js             # Game manager
    ├── models/
    │   ├── adventurer.js       # Adventurer class
    │   ├── enums.js            # Game enumerations
    │   ├── guild.js            # Guild class
    │   ├── item.js             # Item system
    │   └── mission.js          # Mission class
    ├── systems/
    │   ├── ia-controller.js    # AI guild controller
    │   ├── persistence.js      # Save/Load system
    │   ├── random.js           # Random generation
    │   └── simulation.js       # Mission simulation
    ├── ui/
    │   ├── components.js       # UI components
    │   ├── prompts.js          # Interactive prompts
    │   └── theme.js            # Colors and styling
    └── i18n/
        ├── index.js            # Translation system
        ├── en.json             # English translations
        └── fr.json             # French translations
```

## 🎨 Game Mechanics

### Classes
| Class | Strengths | Best Tags |
|-------|-----------|-----------|
| **Warrior** | High ATK | Combat, Boss |
| **Mage** | Magic damage | Magic, Elemental, Undead |
| **Rogue** | Speed, Critical | Traps, Stealth, Ambush |
| **Tank** | Defense | Combat, Boss, Ambush |
| **Priest** | Healing | Long Mission, Undead |
| **Villager** | None | - |

### Personalities
| Personality | Behavior |
|-------------|----------|
| **Brave** | Standard behavior |
| **Coward** | May flee when HP low |
| **Greedy** | May steal rare loot |
| **Loyal** | Protects injured allies |
| **Heroic** | May sacrifice to save team |
| **Opportunist** | Flees when team is losing |

### Team Synergy
- **+5%** per unique class in team
- **+15%** bonus for balanced team (Tank + Healer + DPS)

## 🛠️ Dependencies

- [inquirer](https://www.npmjs.com/package/inquirer) - Interactive prompts
- [chalk](https://www.npmjs.com/package/chalk) - Terminal colors
- [boxen](https://www.npmjs.com/package/boxen) - Box drawing
- [figlet](https://www.npmjs.com/package/figlet) - ASCII art
- [gradient-string](https://www.npmjs.com/package/gradient-string) - Color gradients
- [ora](https://www.npmjs.com/package/ora) - Spinners
- [caxa](https://www.npmjs.com/package/caxa) - Executable packaging

## 📝 License

MIT License
