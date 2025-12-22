import { Classe, Personality, Armes, Armures, Accessoires, Blessures, StatutsSpeciaux } from './enums.js';

/**
 * Represents an adventurer in the guild
 * @class Adventurer
 */
export class Adventurer {
    /**
     * Creates a new Adventurer instance
     * @param {Object} options - Adventurer configuration
     * @param {string} options.name - Adventurer name
     * @param {string} options.classe - Character class
     * @param {Object} options.stats - Combat statistics
     * @param {string} options.personality - Personality trait
     * @param {Object} options.equipement - Equipment loadout
     * @param {Object} options.etat - Current state
     */
    constructor({
        name = 'Unnamed',
        classe = Classe.VILLAGEOIS,
        stats = {},
        personality = Personality.NEUTRE,
        equipement = {},
        etat = {}
    } = {}) {
        this.name = name;
        this.classe = classe;

        this.stats = {
            niveau: stats.niveau ?? 1,
            pv: stats.pv ?? 100,
            pvMax: stats.pvMax ?? stats.pv ?? 100,
            attaque: stats.attaque ?? 10,
            defense: stats.defense ?? 10,
            vitesse: stats.vitesse ?? 10,
            chance: {
                critique: stats.chance?.critique ?? 5,
                esquive: stats.chance?.esquive ?? 5,
                reussiteEvent: stats.chance?.reussiteEvent ?? 50
            }
        };

        this.personality = personality;

        this.equipement = {
            arme: equipement.arme ?? Armes.MAINS_NUES,
            armure: equipement.armure ?? Armures.AUCUNE,
            accessoire: equipement.accessoire ?? Accessoires.AUCUN
        };

        this.etat = {
            vivant: etat.vivant ?? true,
            aFui: etat.aFui ?? false,
            blessure: etat.blessure ?? Blessures.AUCUNE,
            statutSpecial: etat.statutSpecial ?? StatutsSpeciaux.AUCUN
        };
    }

    /** @returns {boolean} True if adventurer is alive */
    isVivant() {
        return this.etat.vivant;
    }

    /** @returns {boolean} True if adventurer is available for missions */
    isDisponible() {
        return this.etat.vivant && !this.etat.aFui;
    }

    /** @returns {boolean} True if adventurer is injured */
    isBesse() {
        return this.etat.blessure !== Blessures.AUCUNE;
    }

    /** Heals the adventurer, removing injuries */
    soigner() {
        this.etat.blessure = Blessures.AUCUNE;
    }

    /** Kills the adventurer */
    tuer() {
        this.etat.vivant = false;
    }

    /**
     * Applies an injury to the adventurer
     * @param {string} blessure - Injury type
     */
    blesser(blessure) {
        this.etat.blessure = blessure;
    }

    /**
     * Gains experience and levels up (+1 level per 100 XP)
     * @param {number} xp - Experience points gained
     */
    gainExperience(xp) {
        const levelsGained = Math.floor(xp / 100);
        if (levelsGained > 0) {
            this.stats.niveau += levelsGained;
            this.stats.pvMax += levelsGained * 10;
            this.stats.pv = this.stats.pvMax;
            this.stats.attaque += levelsGained * 2;
            this.stats.defense += levelsGained * 2;
            this.stats.vitesse += levelsGained;
        }
    }

    /**
     * Calculates the adventurer's total power rating
     * @returns {number} Power value
     */
    getPuissance() {
        return (
            this.stats.niveau * 10 +
            this.stats.attaque * 2 +
            this.stats.defense * 1.5 +
            this.stats.vitesse
        );
    }

    /**
     * Creates a deep clone for simulation (doesn't modify original)
     * @returns {Adventurer} Cloned adventurer
     */
    clone() {
        return new Adventurer({
            name: this.name,
            classe: this.classe,
            stats: JSON.parse(JSON.stringify(this.stats)),
            personality: this.personality,
            equipement: { ...this.equipement },
            etat: { ...this.etat }
        });
    }

    /**
     * Serializes adventurer for saving
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            name: this.name,
            classe: this.classe,
            stats: this.stats,
            personality: this.personality,
            equipement: this.equipement,
            etat: this.etat
        };
    }

    /**
     * Creates an Adventurer from saved data
     * @param {Object} data - Saved adventurer data
     * @returns {Adventurer} Restored adventurer
     */
    static fromJSON(data) {
        return new Adventurer(data);
    }
}
