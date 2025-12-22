import { TypeMission, TagMission, Rarete } from './enums.js';

/**
 * Represents a mission in the game
 * @class Mission
 */
export class Mission {
    /**
     * Creates a new Mission instance
     * @param {Object} options - Mission configuration
     * @param {string} options.nom - Mission name
     * @param {string} options.description - Mission description
     * @param {number} options.difficulte - Difficulty level (1-10)
     * @param {string} options.type - Mission type
     * @param {string[]} options.tags - Mission tags for class bonuses
     * @param {Object} options.recompenses - Reward configuration
     * @param {boolean} options.disponible - Whether mission is available
     */
    constructor({
        nom = 'Unknown Mission',
        description = '',
        difficulte = 1,
        type = TypeMission.EXPLORATION,
        tags = [],
        recompenses = {},
        disponible = true
    } = {}) {
        this.nom = nom;
        this.description = description;
        this.difficulte = Math.min(10, Math.max(1, difficulte));
        this.type = type;
        this.tags = tags;

        this.recompenses = {
            orMin: recompenses.orMin ?? 50,
            orMax: recompenses.orMax ?? 200,
            reputationMin: recompenses.reputationMin ?? 5,
            reputationMax: recompenses.reputationMax ?? 20,
            raretesItems: recompenses.raretesItems ?? [Rarete.COMMUN],
            nombreItemsPossibles: recompenses.nombreItemsPossibles ?? 1
        };

        this.disponible = disponible;
    }

    /**
     * Checks if mission has a specific tag
     * @param {string} tag - Tag to check
     * @returns {boolean} True if tag exists
     */
    hasTag(tag) {
        return this.tags.includes(tag);
    }

    /** @returns {number} Average gold reward */
    calculerOrMoyen() {
        return Math.floor((this.recompenses.orMin + this.recompenses.orMax) / 2);
    }

    /** @returns {number} Average reputation reward */
    calculerReputationMoyenne() {
        return Math.floor((this.recompenses.reputationMin + this.recompenses.reputationMax) / 2);
    }

    /**
     * Generates random gold reward based on success
     * @param {boolean} succes - Whether mission succeeded
     * @param {boolean} partiel - Whether success was partial
     * @returns {number} Gold reward
     */
    genererRecompenseOr(succes = true, partiel = false) {
        const base = this.recompenses.orMin +
            Math.floor(Math.random() * (this.recompenses.orMax - this.recompenses.orMin));

        if (!succes) return 0;
        if (partiel) return Math.floor(base * 0.5);
        return base;
    }

    /**
     * Generates random reputation reward based on success
     * @param {boolean} succes - Whether mission succeeded
     * @param {boolean} partiel - Whether success was partial
     * @returns {number} Reputation reward (-5 on failure)
     */
    genererRecompenseReputation(succes = true, partiel = false) {
        const base = this.recompenses.reputationMin +
            Math.floor(Math.random() * (this.recompenses.reputationMax - this.recompenses.reputationMin));

        if (!succes) return -5;
        if (partiel) return Math.floor(base * 0.3);
        return base;
    }

    /** Marks mission as completed (unavailable) */
    marquerEffectuee() {
        this.disponible = false;
    }

    /** @returns {Object} JSON representation for saving */
    toJSON() {
        return {
            nom: this.nom,
            description: this.description,
            difficulte: this.difficulte,
            type: this.type,
            tags: this.tags,
            recompenses: this.recompenses,
            disponible: this.disponible
        };
    }

    /**
     * Creates Mission from saved data
     * @param {Object} data - Saved mission data
     * @returns {Mission} Restored mission
     */
    static fromJSON(data) {
        return new Mission(data);
    }
}

/** Mission templates organized by difficulty */
export const MissionTemplates = [
    // Easy missions (difficulty 1-3)
    {
        nom: 'Nettoyage de Cave',
        description: 'Des rats géants infestent la cave d\'un aubergiste. Éliminez-les!',
        difficulte: 1,
        type: TypeMission.EXPLORATION,
        tags: [TagMission.COMBAT],
        recompenses: { orMin: 30, orMax: 80, reputationMin: 2, reputationMax: 5 }
    },
    {
        nom: 'Escorte de Marchand',
        description: 'Un marchand souhaite être escorté jusqu\'au village voisin.',
        difficulte: 2,
        type: TypeMission.ESCORTE,
        tags: [TagMission.EMBUSCADE],
        recompenses: { orMin: 50, orMax: 120, reputationMin: 5, reputationMax: 10 }
    },
    {
        nom: 'Récupération d\'Herbes',
        description: 'Récoltez des herbes médicinales dans la forêt enchantée.',
        difficulte: 2,
        type: TypeMission.EXPLORATION,
        tags: [TagMission.STEALTH],
        recompenses: { orMin: 40, orMax: 100, reputationMin: 3, reputationMax: 8 }
    },

    // Medium missions (difficulty 4-6)
    {
        nom: 'Donjon des Ombres',
        description: 'Explorez un ancien donjon et récupérez un artefact perdu.',
        difficulte: 4,
        type: TypeMission.DONJON,
        tags: [TagMission.PIEGES, TagMission.NON_MORTS],
        recompenses: { orMin: 150, orMax: 300, reputationMin: 10, reputationMax: 20, raretesItems: [Rarete.RARE] }
    },
    {
        nom: 'Chasse au Loup-Garou',
        description: 'Un loup-garou terrorise les villageois. Éliminez la menace!',
        difficulte: 5,
        type: TypeMission.CHASSE_BOSS,
        tags: [TagMission.BOSS, TagMission.COMBAT],
        recompenses: { orMin: 200, orMax: 400, reputationMin: 15, reputationMax: 30 }
    },
    {
        nom: 'Enquête sur la Secte',
        description: 'Infiltrez une secte mystérieuse et découvrez leurs plans.',
        difficulte: 5,
        type: TypeMission.ENQUETE,
        tags: [TagMission.STEALTH, TagMission.SOCIAL],
        recompenses: { orMin: 180, orMax: 350, reputationMin: 12, reputationMax: 25 }
    },
    {
        nom: 'Défense du Fort',
        description: 'Défendez un fort contre une vague de gobelins.',
        difficulte: 6,
        type: TypeMission.DEFENSE,
        tags: [TagMission.COMBAT, TagMission.EMBUSCADE],
        recompenses: { orMin: 250, orMax: 450, reputationMin: 20, reputationMax: 35 }
    },

    // Hard missions (difficulty 7-8)
    {
        nom: 'Temple Maudit',
        description: 'Purifiez un temple corrompu par une magie ancienne.',
        difficulte: 7,
        type: TypeMission.DONJON,
        tags: [TagMission.MAGIE, TagMission.NON_MORTS, TagMission.LONGUE_MISSION],
        recompenses: { orMin: 400, orMax: 700, reputationMin: 30, reputationMax: 50, raretesItems: [Rarete.RARE, Rarete.EPIQUE] }
    },
    {
        nom: 'Convoi de la Couronne',
        description: 'Escortez un convoi royal à travers des terres hostiles.',
        difficulte: 7,
        type: TypeMission.ESCORTE,
        tags: [TagMission.EMBUSCADE, TagMission.COMBAT, TagMission.LONGUE_MISSION],
        recompenses: { orMin: 450, orMax: 750, reputationMin: 35, reputationMax: 55 }
    },
    {
        nom: 'Chasseur d\'Élémentaires',
        description: 'Traquez et détruisez un élémentaire de feu en liberté.',
        difficulte: 8,
        type: TypeMission.CHASSE_BOSS,
        tags: [TagMission.ELEMENTAIRE, TagMission.MAGIE, TagMission.BOSS],
        recompenses: { orMin: 500, orMax: 850, reputationMin: 40, reputationMax: 60, raretesItems: [Rarete.EPIQUE] }
    },

    // Very hard missions (difficulty 9-10)
    {
        nom: 'Raid sur la Forteresse Noire',
        description: 'Infiltrez la forteresse du Seigneur des Ténèbres.',
        difficulte: 9,
        type: TypeMission.RAID,
        tags: [TagMission.PIEGES, TagMission.COMBAT, TagMission.NON_MORTS, TagMission.BOSS],
        recompenses: { orMin: 800, orMax: 1500, reputationMin: 60, reputationMax: 100, raretesItems: [Rarete.EPIQUE, Rarete.LEGENDAIRE] }
    },
    {
        nom: 'Le Dragon Ancien',
        description: 'Affrontez le légendaire dragon qui menace le royaume.',
        difficulte: 10,
        type: TypeMission.CHASSE_BOSS,
        tags: [TagMission.BOSS, TagMission.MAGIE, TagMission.ELEMENTAIRE, TagMission.LONGUE_MISSION],
        recompenses: { orMin: 1500, orMax: 3000, reputationMin: 100, reputationMax: 200, raretesItems: [Rarete.LEGENDAIRE], nombreItemsPossibles: 2 }
    }
];

/**
 * Generates a random mission up to max difficulty
 * @param {number} difficulteMax - Maximum difficulty level
 * @returns {Mission} Generated mission
 */
export function generateRandomMission(difficulteMax = 5) {
    const templates = MissionTemplates.filter(t => t.difficulte <= difficulteMax);
    if (templates.length === 0) return new Mission(MissionTemplates[0]);

    const template = templates[Math.floor(Math.random() * templates.length)];
    return new Mission({ ...template, disponible: true });
}

/**
 * Generates multiple varied missions
 * @param {number} count - Number of missions
 * @param {number} difficulteMoyenne - Target average difficulty
 * @returns {Mission[]} Array of missions
 */
export function generateMissions(count = 5, difficulteMoyenne = 5) {
    const missions = [];

    for (let i = 0; i < count; i++) {
        const variation = Math.floor(Math.random() * 5) - 2;
        const diffMax = Math.min(10, Math.max(1, difficulteMoyenne + variation));
        missions.push(generateRandomMission(diffMax));
    }

    return missions;
}
