import { Adventurer } from './adventurer.js';
import { Item } from './item.js';

/**
 * Represents a guild in the game
 * @class Guild
 */
export class Guild {
    /**
     * Creates a new Guild instance
     * @param {Object} options - Guild configuration
     * @param {string} options.nom - Guild name
     * @param {Array} options.aventuriers - List of adventurers
     * @param {Array} options.inventaire - Item inventory
     * @param {number} options.or - Gold amount
     * @param {number} options.reputation - Reputation points
     * @param {boolean} options.isIA - Whether guild is AI-controlled
     * @param {number} options.agressivite - AI aggressiveness (0-100)
     * @param {number} options.prudence - AI caution level (0-100)
     */
    constructor({
        nom = 'Unnamed Guild',
        aventuriers = [],
        inventaire = [],
        or = 1000,
        reputation = 0,
        isIA = false,
        agressivite = 50,
        prudence = 50
    } = {}) {
        this.nom = nom;
        this.aventuriers = aventuriers.map(a => a instanceof Adventurer ? a : Adventurer.fromJSON(a));
        this.inventaire = inventaire.map(i => i instanceof Item ? i : Item.fromJSON(i));
        this.or = or;
        this.reputation = reputation;
        this.isIA = isIA;
        this.agressivite = agressivite;
        this.prudence = prudence;
    }

    /** @returns {Adventurer[]} List of living, non-fled adventurers */
    getAventuriersVivants() {
        return this.aventuriers.filter(a => a.isDisponible());
    }

    /** @returns {Adventurer[]} List of injured adventurers */
    getAventuriersBesses() {
        return this.aventuriers.filter(a => a.isVivant() && a.isBesse());
    }

    /**
     * Adds an adventurer to the guild
     * @param {Adventurer} aventurier - Adventurer to add
     */
    ajouterAventurier(aventurier) {
        this.aventuriers.push(aventurier);
    }

    /**
     * Removes an adventurer by name
     * @param {string} nom - Adventurer name
     * @returns {boolean} Success status
     */
    retirerAventurier(nom) {
        const index = this.aventuriers.findIndex(a => a.name === nom);
        if (index !== -1) {
            this.aventuriers.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Finds an adventurer by name
     * @param {string} nom - Adventurer name
     * @returns {Adventurer|null} Found adventurer or null
     */
    chercherAventurier(nom) {
        return this.aventuriers.find(a => a.name === nom) || null;
    }

    /** @returns {number} Count of active adventurers */
    getNombreAventuriersActifs() {
        return this.getAventuriersVivants().length;
    }

    /** @returns {number} Average level of active adventurers */
    getNiveauMoyen() {
        const vivants = this.getAventuriersVivants();
        if (vivants.length === 0) return 0;
        const total = vivants.reduce((sum, a) => sum + a.stats.niveau, 0);
        return Math.round(total / vivants.length);
    }

    /** @returns {number} Total power of all active adventurers */
    getPuissanceTotale() {
        return this.getAventuriersVivants().reduce((sum, a) => sum + a.getPuissance(), 0);
    }

    /**
     * Checks if guild can afford a payment
     * @param {number} montant - Amount to check
     * @returns {boolean} True if affordable
     */
    peutPayer(montant) {
        return this.or >= montant;
    }

    /**
     * Pays gold from guild treasury
     * @param {number} montant - Amount to pay
     * @returns {boolean} Success status
     */
    payerOr(montant) {
        if (this.peutPayer(montant)) {
            this.or -= montant;
            return true;
        }
        return false;
    }

    /**
     * Adds gold to guild treasury
     * @param {number} montant - Amount to add
     */
    gagnerOr(montant) {
        this.or += montant;
    }

    /**
     * Modifies reputation by delta
     * @param {number} delta - Amount to change (can be negative)
     */
    modifierReputation(delta) {
        this.reputation = Math.max(0, this.reputation + delta);
    }

    /** @returns {number} Reputation tier (0-5) */
    getNiveauReputation() {
        if (this.reputation < 100) return 0;
        if (this.reputation < 300) return 1;
        if (this.reputation < 600) return 2;
        if (this.reputation < 1000) return 3;
        if (this.reputation < 2000) return 4;
        return 5;
    }

    /** @returns {string} Reputation status name */
    getStatutReputation() {
        const levels = ['Unknown', 'Known', 'Respected', 'Famous', 'Legendary', 'Mythical'];
        return levels[this.getNiveauReputation()];
    }

    /**
     * Adds item to inventory
     * @param {Item} item - Item to add
     */
    ajouterItem(item) {
        this.inventaire.push(item);
    }

    /**
     * Removes item by name
     * @param {string} nom - Item name
     * @returns {boolean} Success status
     */
    retirerItem(nom) {
        const index = this.inventaire.findIndex(i => i.nom === nom);
        if (index !== -1) {
            this.inventaire.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Finds item by name
     * @param {string} nom - Item name
     * @returns {Item|null} Found item or null
     */
    chercherItem(nom) {
        return this.inventaire.find(i => i.nom === nom) || null;
    }

    /**
     * Gets items filtered by type
     * @param {string} type - Item type
     * @returns {Item[]} Matching items
     */
    getItemsParType(type) {
        return this.inventaire.filter(i => i.type === type);
    }

    /** @returns {boolean} True if guild has no gold and no adventurers */
    estEnFaillite() {
        return this.or <= 0 && this.getNombreAventuriersActifs() === 0;
    }

    /** @returns {boolean} True if guild has no active adventurers */
    estDecimee() {
        return this.getNombreAventuriersActifs() === 0;
    }

    /** @returns {Object} JSON representation for saving */
    toJSON() {
        return {
            nom: this.nom,
            aventuriers: this.aventuriers.map(a => a.toJSON()),
            inventaire: this.inventaire.map(i => i.toJSON()),
            or: this.or,
            reputation: this.reputation,
            isIA: this.isIA,
            agressivite: this.agressivite,
            prudence: this.prudence
        };
    }

    /**
     * Creates Guild from saved data
     * @param {Object} data - Saved guild data
     * @returns {Guild} Restored guild
     */
    static fromJSON(data) {
        return new Guild({
            ...data,
            aventuriers: data.aventuriers?.map(a => Adventurer.fromJSON(a)) ?? [],
            inventaire: data.inventaire?.map(i => Item.fromJSON(i)) ?? []
        });
    }
}
