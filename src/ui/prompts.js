import { select, confirm, checkbox, input, number } from '@inquirer/prompts';
import { colors, icons } from './theme.js';

// ===== PROMPTS - Menus Interactifs =====

// Menu principal
export async function mainMenuPrompt() {
    return await select({
        message: `${colors.primary('Menu Principal')} ${icons.arrowRight}`,
        choices: [
            { name: `${icons.star} Consulter la guilde`, value: 'guild_stats' },
            { name: `${icons.sword} Liste des aventuriers`, value: 'adventurers' },
            { name: `${icons.shield} Inventaire de la guilde`, value: 'inventory' },
            { name: `${icons.fire} Missions disponibles`, value: 'missions' },
            { name: `${icons.gold} Recruter un aventurier`, value: 'recruit' },
            { name: `${icons.magic} Équiper un aventurier`, value: 'equip' },
            { name: `${icons.heart} Infirmerie (Soigner)`, value: 'infirmary' },
            { name: `${icons.check} Sauvegarder la partie`, value: 'save' },
            { name: `${icons.arrowDown} Charger une partie`, value: 'load' },
            { name: `${icons.arrow} Lancer le tour suivant`, value: 'next_turn' },
            { name: `${colors.error(icons.error)} Quitter`, value: 'quit' }
        ],
        theme: {
            prefix: '',
            style: {
                highlight: (text) => colors.primary(text)
            }
        }
    });
}

// Menu de sélection d'aventurier
export async function selectAdventurerPrompt(aventuriers, message = 'Sélectionner un aventurier') {
    if (aventuriers.length === 0) {
        return null;
    }

    const choices = aventuriers.map((a, i) => ({
        name: `${a.name} - ${a.classe} (Niv. ${a.stats.niveau})`,
        value: i
    }));

    choices.push({ name: `${colors.textDim('← Retour')}`, value: -1 });

    const result = await select({
        message: `${colors.primary(message)} ${icons.arrowRight}`,
        choices,
        theme: {
            prefix: icons.sword,
            style: {
                highlight: (text) => colors.primary(text)
            }
        }
    });

    return result === -1 ? null : result;
}

// Menu de sélection multiple d'aventuriers
export async function selectMultipleAdventurersPrompt(aventuriers, maxSelection = 4, message = 'Sélectionner une équipe') {
    if (aventuriers.length === 0) {
        return [];
    }

    const choices = aventuriers.map((a, i) => ({
        name: `${a.name} - ${a.classe} (Niv. ${a.stats.niveau} | Puissance: ${a.getPuissance()})`,
        value: i
    }));

    const result = await checkbox({
        message: `${colors.primary(message)} (max ${maxSelection})`,
        choices,
        validate: (selected) => {
            if (selected.length > maxSelection) {
                return `Vous ne pouvez sélectionner que ${maxSelection} aventuriers maximum`;
            }
            if (selected.length === 0) {
                return 'Vous devez sélectionner au moins un aventurier';
            }
            return true;
        },
        theme: {
            prefix: icons.sword,
            style: {
                highlight: (text) => colors.primary(text)
            }
        }
    });

    return result;
}

// Menu de sélection de mission
export async function selectMissionPrompt(missions, message = 'Sélectionner une mission') {
    if (missions.length === 0) {
        return null;
    }

    const choices = missions.map((m, i) => ({
        name: `${m.nom} - Difficulté ${m.difficulte}/10 - Or: ${m.calculerOrMoyen()}`,
        value: i
    }));

    choices.push({ name: `${colors.textDim('← Retour')}`, value: -1 });

    const result = await select({
        message: `${colors.primary(message)} ${icons.arrowRight}`,
        choices,
        theme: {
            prefix: icons.fire,
            style: {
                highlight: (text) => colors.primary(text)
            }
        }
    });

    return result === -1 ? null : result;
}

// Menu de sélection d'item
export async function selectItemPrompt(items, message = 'Sélectionner un item') {
    if (items.length === 0) {
        return null;
    }

    const choices = items.map((item, i) => ({
        name: `${item.nom} [${item.rarete}] - ${item.type}`,
        value: i
    }));

    choices.push({ name: `${colors.textDim('← Retour')}`, value: -1 });

    const result = await select({
        message: `${colors.primary(message)} ${icons.arrowRight}`,
        choices,
        theme: {
            prefix: icons.magic,
            style: {
                highlight: (text) => colors.primary(text)
            }
        }
    });

    return result === -1 ? null : result;
}

// Confirmation
export async function confirmPrompt(message) {
    return await confirm({
        message: `${colors.warning(message)}`,
        default: false,
        theme: {
            prefix: icons.warning
        }
    });
}

// Attendre une entrée pour continuer
export async function pressEnterPrompt(message = 'Appuyez sur Entrée pour continuer...') {
    await input({
        message: colors.textDim(message),
        theme: {
            prefix: ''
        }
    });
}

// Saisie de texte
export async function textInputPrompt(message, defaultValue = '') {
    return await input({
        message: `${colors.primary(message)}`,
        default: defaultValue,
        theme: {
            prefix: icons.arrowRight
        }
    });
}

// Saisie de nombre
export async function numberInputPrompt(message, min = 0, max = 100, defaultValue = 0) {
    return await number({
        message: `${colors.primary(message)}`,
        default: defaultValue,
        validate: (value) => {
            if (value < min || value > max) {
                return `La valeur doit être entre ${min} et ${max}`;
            }
            return true;
        },
        theme: {
            prefix: icons.arrowRight
        }
    });
}

// Menu type d'équipement
export async function selectEquipmentTypePrompt() {
    return await select({
        message: `${colors.primary("Type d'équipement")} ${icons.arrowRight}`,
        choices: [
            { name: `${icons.sword} Arme`, value: 'Arme' },
            { name: `${icons.shield} Armure`, value: 'Armure' },
            { name: `${icons.magic} Accessoire`, value: 'Accessoire' },
            { name: `${colors.textDim('← Retour')}`, value: null }
        ],
        theme: {
            prefix: icons.magic,
            style: {
                highlight: (text) => colors.primary(text)
            }
        }
    });
}

// Menu candidats à recruter
export async function selectRecruitPrompt(candidats, orDisponible) {
    if (candidats.length === 0) {
        return null;
    }

    const choices = candidats.map((c, i) => {
        const cout = 100 * c.stats.niveau + c.stats.attaque * 5 + c.stats.defense * 5;
        const affordable = orDisponible >= cout;

        return {
            name: `${c.name} - ${c.classe} (Niv. ${c.stats.niveau}) - ${cout} ${icons.gold}${!affordable ? colors.error(' [Insuffisant]') : ''}`,
            value: i,
            disabled: !affordable ? 'Pas assez d\'or' : false
        };
    });

    choices.push({ name: `${colors.textDim('← Retour')}`, value: -1 });

    const result = await select({
        message: `${colors.primary('Recruter un aventurier')} ${icons.arrowRight}`,
        choices,
        theme: {
            prefix: icons.gold,
            style: {
                highlight: (text) => colors.primary(text)
            }
        }
    });

    return result === -1 ? null : result;
}
