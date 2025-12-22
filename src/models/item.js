import { TypeItem, Rarete, Classe } from './enums.js';

/**
 * Represents an equippable item in the game
 * @class Item
 */
export class Item {
    /**
     * Creates a new Item instance
     * @param {Object} options - Item configuration
     * @param {string} options.nom - Item name
     * @param {string} options.type - Item type (ARME, ARMURE, ACCESSOIRE)
     * @param {Object} options.bonus - Stat bonuses
     * @param {string} options.rarete - Rarity level
     * @param {Object} options.conditions - Usage conditions
     * @param {number} options.durabilite - Durability (0-100)
     */
    constructor({
        nom = 'Unknown Item',
        type = TypeItem.ACCESSOIRE,
        bonus = {},
        rarete = Rarete.COMMUN,
        conditions = {},
        durabilite = 100
    } = {}) {
        this.nom = nom;
        this.type = type;

        this.bonus = {
            attaque: bonus.attaque ?? 0,
            defense: bonus.defense ?? 0,
            vitesse: bonus.vitesse ?? 0,
            critique: bonus.critique ?? 0,
            esquive: bonus.esquive ?? 0
        };

        this.rarete = rarete;

        this.conditions = {
            classeRequise: conditions.classeRequise ?? null,
            niveauMinimum: conditions.niveauMinimum ?? 1,
            toutesClasses: conditions.toutesClasses ?? true
        };

        this.durabilite = durabilite;
    }

    /**
     * Checks if item can be used by an adventurer
     * @param {string} classe - Character class
     * @param {number} niveau - Character level
     * @returns {boolean} True if usable
     */
    estUtilisablePar(classe, niveau) {
        if (niveau < this.conditions.niveauMinimum) return false;
        if (!this.conditions.toutesClasses && this.conditions.classeRequise !== classe) return false;
        return true;
    }

    /**
     * Reduces item durability
     * @param {number} valeur - Amount to reduce
     */
    diminuerDurabilite(valeur) {
        this.durabilite = Math.max(0, this.durabilite - valeur);
    }

    /** @returns {boolean} True if item is broken */
    estCasse() {
        return this.durabilite <= 0;
    }

    /** @returns {string} Color name based on rarity */
    getRareteColor() {
        switch (this.rarete) {
            case Rarete.COMMUN: return 'white';
            case Rarete.RARE: return 'blue';
            case Rarete.EPIQUE: return 'magenta';
            case Rarete.LEGENDAIRE: return 'yellow';
            default: return 'white';
        }
    }

    /** @returns {Object} JSON representation for saving */
    toJSON() {
        return {
            nom: this.nom,
            type: this.type,
            bonus: this.bonus,
            rarete: this.rarete,
            conditions: this.conditions,
            durabilite: this.durabilite
        };
    }

    /**
     * Creates Item from saved data
     * @param {Object} data - Saved item data
     * @returns {Item} Restored item
     */
    static fromJSON(data) {
        return new Item(data);
    }
}

/** Item template factories organized by type */
export const ItemTemplates = {
    // Weapons
    epeeRouillae: () => new Item({ nom: 'Épée Rouillée', type: TypeItem.ARME, bonus: { attaque: 3 }, rarete: Rarete.COMMUN }),
    epeeFer: () => new Item({ nom: 'Épée de Fer', type: TypeItem.ARME, bonus: { attaque: 8, critique: 2 }, rarete: Rarete.COMMUN }),
    epeeAcier: () => new Item({ nom: 'Épée d\'Acier', type: TypeItem.ARME, bonus: { attaque: 15, critique: 5 }, rarete: Rarete.RARE }),
    dagueSombre: () => new Item({ nom: 'Dague de l\'Ombre', type: TypeItem.ARME, bonus: { attaque: 10, vitesse: 5, critique: 10 }, rarete: Rarete.RARE, conditions: { classeRequise: Classe.VOLEUR, toutesClasses: false } }),
    batonElementaire: () => new Item({ nom: 'Bâton Élémentaire', type: TypeItem.ARME, bonus: { attaque: 20 }, rarete: Rarete.EPIQUE, conditions: { classeRequise: Classe.MAGE, toutesClasses: false } }),
    lameLegende: () => new Item({ nom: 'Lame Légendaire', type: TypeItem.ARME, bonus: { attaque: 35, critique: 15, vitesse: 5 }, rarete: Rarete.LEGENDAIRE }),

    // Armor
    armureCuir: () => new Item({ nom: 'Armure de Cuir', type: TypeItem.ARMURE, bonus: { defense: 5 }, rarete: Rarete.COMMUN }),
    cotteMailles: () => new Item({ nom: 'Cotte de Mailles', type: TypeItem.ARMURE, bonus: { defense: 12 }, rarete: Rarete.RARE }),
    armurePlaques: () => new Item({ nom: 'Armure de Plaques', type: TypeItem.ARMURE, bonus: { defense: 25 }, rarete: Rarete.EPIQUE, conditions: { classeRequise: Classe.TANK, toutesClasses: false } }),

    // Accessories
    anneauSimple: () => new Item({ nom: 'Anneau Simple', type: TypeItem.ACCESSOIRE, bonus: { attaque: 2, defense: 2 }, rarete: Rarete.COMMUN }),
    amuletteChance: () => new Item({ nom: 'Amulette de Chance', type: TypeItem.ACCESSOIRE, bonus: { critique: 8, esquive: 5 }, rarete: Rarete.RARE }),
    bottesVent: () => new Item({ nom: 'Bottes du Vent', type: TypeItem.ACCESSOIRE, bonus: { vitesse: 15, esquive: 8 }, rarete: Rarete.EPIQUE })
};

/**
 * Generates a random item of specified rarity
 * @param {string} rarete - Target rarity
 * @returns {Item} Generated item
 */
export function generateRandomItem(rarete = Rarete.COMMUN) {
    const templates = Object.values(ItemTemplates);
    const filteredTemplates = templates.filter(t => t().rarete === rarete);

    if (filteredTemplates.length === 0) {
        return templates[Math.floor(Math.random() * templates.length)]();
    }
    return filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)]();
}
