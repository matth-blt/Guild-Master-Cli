import chalk from 'chalk';
import gradient from 'gradient-string';

// ===== THEME SYSTEM - Style Gemini CLI =====

// Gradients personnalisés
export const gradients = {
    // Gradient principal pour le titre
    title: gradient(['#00d9ff', '#0066ff', '#9933ff']),

    // Gradient pour les succès
    success: gradient(['#00ff88', '#00cc66', '#00aa44']),

    // Gradient pour les erreurs
    error: gradient(['#ff4444', '#ff0066', '#cc0044']),

    // Gradient pour les avertissements
    warning: gradient(['#ffaa00', '#ff8800', '#ff6600']),

    // Gradient doré pour les récompenses
    gold: gradient(['#ffd700', '#ffb800', '#ff9500']),

    // Gradient pour la magie/épique
    magic: gradient(['#9933ff', '#cc33ff', '#ff33cc']),

    // Gradient arc-en-ciel
    rainbow: gradient.rainbow,

    // Gradient pastel
    pastel: gradient.pastel
};

// Couleurs du thème
export const colors = {
    // Couleurs primaires
    primary: chalk.hex('#00d9ff'),
    secondary: chalk.hex('#9933ff'),
    accent: chalk.hex('#ff33cc'),

    // États
    success: chalk.hex('#00ff88'),
    error: chalk.hex('#ff4444'),
    warning: chalk.hex('#ffaa00'),
    info: chalk.hex('#00aaff'),

    // Texte
    text: chalk.white,
    textDim: chalk.gray,
    textBold: chalk.bold.white,

    // Raretés
    commun: chalk.white,
    rare: chalk.hex('#4488ff'),
    epique: chalk.hex('#aa44ff'),
    legendaire: chalk.hex('#ffd700'),

    // Classes
    guerrier: chalk.hex('#ff4444'),
    mage: chalk.hex('#4488ff'),
    voleur: chalk.hex('#44ff44'),
    healer: chalk.hex('#ffff44'),
    tank: chalk.hex('#ff8844'),
    villageois: chalk.gray,

    // Stats
    or: chalk.hex('#ffd700'),
    reputation: chalk.hex('#44ffff'),
    niveau: chalk.hex('#ff88ff'),
    pv: chalk.hex('#ff4444'),
    attaque: chalk.hex('#ff8844'),
    defense: chalk.hex('#4488ff'),
    vitesse: chalk.hex('#44ff44')
};

// Icônes/symboles
export const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
    star: '★',
    heart: '❤',
    sword: '⚔',
    shield: '🛡',
    gold: '💰',
    skull: '💀',
    crown: '👑',
    fire: '🔥',
    magic: '✨',
    arrow: '→',
    arrowRight: '▸',
    arrowDown: '▾',
    bullet: '•',
    check: '☑',
    uncheck: '☐',
    loading: '◌',
    dot: '●'
};

// Styles de bordures pour boxen
export const boxStyles = {
    default: {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
    },
    success: {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
    },
    error: {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red'
    },
    warning: {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'yellow'
    },
    title: {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'double',
        borderColor: 'magenta',
        textAlignment: 'center'
    },
    menu: {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
    },
    stats: {
        padding: 1,
        margin: { top: 0, bottom: 1 },
        borderStyle: 'single',
        borderColor: 'gray'
    }
};

// Formatage de texte
export function formatGold(amount) {
    return `${colors.or(amount.toLocaleString())} ${icons.gold}`;
}

export function formatReputation(amount) {
    return `${colors.reputation(amount.toLocaleString())} ${icons.star}`;
}

export function formatNiveau(niveau) {
    return colors.niveau(`Niv. ${niveau}`);
}

export function formatPV(pv, pvMax) {
    const ratio = pv / pvMax;
    let color = colors.success;
    if (ratio < 0.3) color = colors.error;
    else if (ratio < 0.6) color = colors.warning;
    return `${color(`${pv}/${pvMax}`)} ${icons.heart}`;
}

// Couleur selon la rareté
export function getRareteColor(rarete) {
    switch (rarete) {
        case 'Commun': return colors.commun;
        case 'Rare': return colors.rare;
        case 'Épique': return colors.epique;
        case 'Légendaire': return colors.legendaire;
        default: return colors.text;
    }
}

// Couleur selon la classe
export function getClasseColor(classe) {
    switch (classe) {
        case 'Guerrier': return colors.guerrier;
        case 'Mage': return colors.mage;
        case 'Voleur': return colors.voleur;
        case 'Prêtre': return colors.healer;
        case 'Tank': return colors.tank;
        case 'Villageois': return colors.villageois;
        default: return colors.text;
    }
}

// Barre de progression visuelle
export function progressBar(current, max, width = 20, filledChar = '█', emptyChar = '░') {
    const ratio = Math.min(1, Math.max(0, current / max));
    const filled = Math.round(ratio * width);
    const empty = width - filled;

    let color = colors.success;
    if (ratio < 0.3) color = colors.error;
    else if (ratio < 0.6) color = colors.warning;

    return color(filledChar.repeat(filled)) + colors.textDim(emptyChar.repeat(empty));
}
