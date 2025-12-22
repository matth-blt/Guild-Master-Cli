import { Classe, Personality, Armes, Armures, Accessoires, Blessures, StatutsSpeciaux } from './enums.js';

// ===== ADVENTURER CLASS =====
export class Adventurer {
    constructor({
        name = 'Sans Nom',
        classe = Classe.VILLAGEOIS,
        stats = {},
        personality = Personality.NEUTRE,
        equipement = {},
        etat = {}
    } = {}) {
        this.name = name;
        this.classe = classe;

        // Statistics
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

        // Equipment
        this.equipement = {
            arme: equipement.arme ?? Armes.MAINS_NUES,
            armure: equipement.armure ?? Armures.AUCUNE,
            accessoire: equipement.accessoire ?? Accessoires.AUCUN
        };

        // State
        this.etat = {
            vivant: etat.vivant ?? true,
            aFui: etat.aFui ?? false,
            blessure: etat.blessure ?? Blessures.AUCUNE,
            statutSpecial: etat.statutSpecial ?? StatutsSpeciaux.AUCUN
        };
    }

    // ----- GETTERS -----
    isVivant() {
        return this.etat.vivant;
    }

    isDisponible() {
        return this.etat.vivant && !this.etat.aFui;
    }

    isBesse() {
        return this.etat.blessure !== Blessures.AUCUNE;
    }

    // ----- METHODS -----
    soigner() {
        this.etat.blessure = Blessures.AUCUNE;
    }

    tuer() {
        this.etat.vivant = false;
    }

    blesser(blessure) {
        this.etat.blessure = blessure;
    }

    gainExperience(xp) {
        // +1 niveau tous les 100 XP
        const niveauxGagnes = Math.floor(xp / 100);
        if (niveauxGagnes > 0) {
            this.stats.niveau += niveauxGagnes;
            // Augmentation des stats avec le niveau
            this.stats.pvMax += niveauxGagnes * 10;
            this.stats.pv = this.stats.pvMax;
            this.stats.attaque += niveauxGagnes * 2;
            this.stats.defense += niveauxGagnes * 2;
            this.stats.vitesse += niveauxGagnes;
        }
    }

    // Calcul de la puissance globale de l'aventurier
    getPuissance() {
        return (
            this.stats.niveau * 10 +
            this.stats.attaque * 2 +
            this.stats.defense * 1.5 +
            this.stats.vitesse
        );
    }

    // Clone pour simulation (ne modifie pas l'original)
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

    // Sérialisation pour sauvegarde
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

    static fromJSON(data) {
        return new Adventurer(data);
    }
}
