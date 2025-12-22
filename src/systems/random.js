import { Adventurer } from '../models/adventurer.js';
import { Guild } from '../models/guild.js';
import { Mission, generateMissions } from '../models/mission.js';
import { Classe, Personality, Armes, Armures, Accessoires, ArmeParDefaut, ArmureParDefaut } from '../models/enums.js';

/**
 * Random generation system for adventurers, guilds, and missions
 * @module systems/random
 */

/** Available adventurer first names */
const PRENOMS = [
    'Aldric', 'Balthazar', 'Cedric', 'Darius', 'Eldric', 'Fenris', 'Gideon', 'Hadrian',
    'Isolde', 'Jasper', 'Kira', 'Lyra', 'Magnus', 'Nadia', 'Orion', 'Petra',
    'Quinn', 'Roland', 'Selena', 'Theron', 'Ulric', 'Vesper', 'Wren', 'Xander',
    'Yara', 'Zephyr', 'Arwen', 'Brynn', 'Caspian', 'Draven', 'Elara', 'Fiona',
    'Gareth', 'Helena', 'Ivy', 'Jace', 'Kael', 'Luna', 'Mikael', 'Nyx'
];

/** Available guild names */
const NOMS_GUILDES = [
    'Les Faucons de Fer', 'La Lame d\'Argent', 'Les Chevaliers de l\'Aube',
    'L\'Ordre du Dragon', 'Les Ombres Silencieuses', 'La Compagnie du Crépuscule',
    'Les Gardiens de la Flamme', 'La Légion des Braves', 'Les Chasseurs d\'Étoiles',
    'L\'Alliance des Héros'
];

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a random element from an array
 * @param {Array} array - Source array
 * @returns {*} Random element
 */
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates stats based on level and class
 * @param {number} niveau - Character level
 * @param {string} classe - Character class
 * @returns {Object} Generated stats object
 */
function generateStats(niveau, classe) {
    const baseStats = {
        [Classe.VILLAGEOIS]: { pv: 80, atk: 5, def: 5, vit: 5, crit: 3, esq: 3 },
        [Classe.GUERRIER]: { pv: 120, atk: 15, def: 10, vit: 8, crit: 10, esq: 5 },
        [Classe.MAGE]: { pv: 70, atk: 20, def: 5, vit: 10, crit: 15, esq: 8 },
        [Classe.TANK]: { pv: 150, atk: 8, def: 20, vit: 5, crit: 5, esq: 3 },
        [Classe.HEALER]: { pv: 90, atk: 8, def: 8, vit: 8, crit: 8, esq: 8 },
        [Classe.VOLEUR]: { pv: 80, atk: 12, def: 6, vit: 15, crit: 20, esq: 15 }
    };

    const base = baseStats[classe] || baseStats[Classe.VILLAGEOIS];
    const pvMax = base.pv + niveau * 10 + randomInt(-5, 10);

    return {
        niveau,
        pv: pvMax,
        pvMax: pvMax,
        attaque: base.atk + niveau * 2 + randomInt(-2, 3),
        defense: base.def + niveau * 2 + randomInt(-2, 3),
        vitesse: base.vit + niveau + randomInt(-1, 2),
        chance: {
            critique: base.crit + randomInt(0, 5),
            esquive: base.esq + randomInt(0, 5),
            reussiteEvent: 50 + niveau * 2 + randomInt(-5, 10)
        }
    };
}

/**
 * Generates a random adventurer
 * @param {number} niveauMoyen - Target average level
 * @returns {Adventurer} Generated adventurer
 */
export function generateRandomAdventurer(niveauMoyen = 1) {
    const niveau = Math.max(1, niveauMoyen + randomInt(-1, 2));
    const classes = Object.values(Classe).filter(c => c !== Classe.VILLAGEOIS);
    const classe = randomElement(classes);
    const personalities = Object.values(Personality);

    return new Adventurer({
        name: randomElement(PRENOMS),
        classe,
        stats: generateStats(niveau, classe),
        personality: randomElement(personalities),
        equipement: {
            arme: ArmeParDefaut[classe] || Armes.MAINS_NUES,
            armure: ArmureParDefaut[classe] || Armures.AUCUNE,
            accessoire: Accessoires.AUCUN
        },
        etat: { vivant: true, aFui: false, blessure: 'Aucune', statutSpecial: 'Aucun' }
    });
}

/**
 * Generates multiple adventurers with unique names
 * @param {number} count - Number of adventurers
 * @param {number} niveauMoyen - Target average level
 * @returns {Adventurer[]} Array of adventurers
 */
export function generateAdventurers(count, niveauMoyen = 1) {
    const aventuriers = [];
    const nomsUtilises = new Set();

    for (let i = 0; i < count; i++) {
        let aventurier = generateRandomAdventurer(niveauMoyen);
        while (nomsUtilises.has(aventurier.name)) {
            aventurier = generateRandomAdventurer(niveauMoyen);
        }
        nomsUtilises.add(aventurier.name);
        aventuriers.push(aventurier);
    }
    return aventuriers;
}

/**
 * Generates a guild with adventurers
 * @param {string} nom - Guild name
 * @param {number} nbAventuriers - Number of adventurers
 * @param {number} orDepart - Starting gold
 * @param {boolean} isIA - Whether this is an AI-controlled guild
 * @returns {Guild} Generated guild
 */
export function generateGuild(nom, nbAventuriers, orDepart, isIA = false) {
    const aventuriers = generateAdventurers(nbAventuriers, 1);
    return new Guild({
        nom, aventuriers, inventaire: [], or: orDepart,
        reputation: isIA ? randomInt(50, 150) : 0, isIA,
        agressivite: isIA ? randomInt(30, 70) : 50,
        prudence: isIA ? randomInt(30, 70) : 50
    });
}

/**
 * Generates multiple guilds (1 player + N AI)
 * @param {number} nbGuildes - Total number of guilds
 * @param {number} nbAventuriersParGuilde - Adventurers per guild
 * @param {number} orDepart - Starting gold
 * @returns {Guild[]} Array of guilds (first is player, rest are AI)
 */
export function generateGuilds(nbGuildes = 3, nbAventuriersParGuilde = 10, orDepart = 1000) {
    const guildes = [];
    const nomsUtilises = new Set();

    for (let i = 0; i < nbGuildes; i++) {
        let nom;
        do { nom = randomElement(NOMS_GUILDES); } while (nomsUtilises.has(nom));
        nomsUtilises.add(nom);
        guildes.push(generateGuild(nom, nbAventuriersParGuilde, orDepart, i > 0));
    }
    return guildes;
}

/**
 * Generates recruitment candidates
 * @param {number} count - Number of candidates
 * @param {number} niveauMoyen - Target average level
 * @returns {Adventurer[]} Array of candidates
 */
export function generateRecruitCandidates(count = 4, niveauMoyen = 2) {
    return generateAdventurers(count, niveauMoyen);
}

/**
 * Calculates recruitment cost for an adventurer
 * @param {Adventurer} aventurier - Adventurer to price
 * @returns {number} Gold cost
 */
export function calculateRecruitCost(aventurier) {
    return 100 * aventurier.stats.niveau + aventurier.stats.attaque * 5 + aventurier.stats.defense * 5;
}

/**
 * Generates missions based on current turn
 * @param {number} tour - Current turn number
 * @param {number} count - Number of missions
 * @returns {Mission[]} Array of missions with difficulty scaling
 */
export function generateTurnMissions(tour, count = 5) {
    const difficulteMoyenne = Math.min(8, 2 + Math.floor(tour / 3));
    return generateMissions(count, difficulteMoyenne);
}
