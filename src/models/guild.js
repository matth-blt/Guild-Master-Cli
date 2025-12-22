import { Adventurer } from './adventurer.js';
import { Item } from './item.js';

// ===== GUILD CLASS =====
export class Guild {
    constructor({
        nom = 'Guilde Sans Nom',
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

        // Paramètres IA
        this.isIA = isIA;
        this.agressivite = agressivite;
        this.prudence = prudence;
    }

    // ===== GESTION AVENTURIERS =====
    getAventuriersVivants() {
        return this.aventuriers.filter(a => a.isDisponible());
    }

    getAventuriersBesses() {
        return this.aventuriers.filter(a => a.isVivant() && a.isBesse());
    }

    ajouterAventurier(aventurier) {
        this.aventuriers.push(aventurier);
    }

    retirerAventurier(nom) {
        const index = this.aventuriers.findIndex(a => a.name === nom);
        if (index !== -1) {
            this.aventuriers.splice(index, 1);
            return true;
        }
        return false;
    }

    chercherAventurier(nom) {
        return this.aventuriers.find(a => a.name === nom) || null;
    }

    getNombreAventuriersActifs() {
        return this.getAventuriersVivants().length;
    }

    getNiveauMoyen() {
        const vivants = this.getAventuriersVivants();
        if (vivants.length === 0) return 0;
        const total = vivants.reduce((sum, a) => sum + a.stats.niveau, 0);
        return Math.round(total / vivants.length);
    }

    getPuissanceTotale() {
        return this.getAventuriersVivants().reduce((sum, a) => sum + a.getPuissance(), 0);
    }

    // ===== GESTION ÉCONOMIE =====
    peutPayer(montant) {
        return this.or >= montant;
    }

    payerOr(montant) {
        if (this.peutPayer(montant)) {
            this.or -= montant;
            return true;
        }
        return false;
    }

    gagnerOr(montant) {
        this.or += montant;
    }

    // ===== GESTION RÉPUTATION =====
    modifierReputation(delta) {
        this.reputation = Math.max(0, this.reputation + delta);
    }

    getNiveauReputation() {
        if (this.reputation < 100) return 0;
        if (this.reputation < 300) return 1;
        if (this.reputation < 600) return 2;
        if (this.reputation < 1000) return 3;
        if (this.reputation < 2000) return 4;
        return 5;
    }

    getStatutReputation() {
        const niveaux = ['Inconnue', 'Connue', 'Respectée', 'Célèbre', 'Légendaire', 'Mythique'];
        return niveaux[this.getNiveauReputation()];
    }

    // ===== GESTION INVENTAIRE =====
    ajouterItem(item) {
        this.inventaire.push(item);
    }

    retirerItem(nom) {
        const index = this.inventaire.findIndex(i => i.nom === nom);
        if (index !== -1) {
            this.inventaire.splice(index, 1);
            return true;
        }
        return false;
    }

    chercherItem(nom) {
        return this.inventaire.find(i => i.nom === nom) || null;
    }

    getItemsParType(type) {
        return this.inventaire.filter(i => i.type === type);
    }

    // ===== CONDITIONS DE FIN =====
    estEnFaillite() {
        return this.or <= 0 && this.getNombreAventuriersActifs() === 0;
    }

    estDecimee() {
        return this.getNombreAventuriersActifs() === 0;
    }

    // ===== SÉRIALISATION =====
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

    static fromJSON(data) {
        return new Guild({
            ...data,
            aventuriers: data.aventuriers?.map(a => Adventurer.fromJSON(a)) ?? [],
            inventaire: data.inventaire?.map(i => Item.fromJSON(i)) ?? []
        });
    }
}
