import { generateGuilds, generateRecruitCandidates, generateTurnMissions, calculateRecruitCost } from '../systems/random.js';
import { resolveMission, applyMissionResults } from '../systems/simulation.js';
import { executeAllIATurns } from '../systems/ia-controller.js';
import { saveGame, loadGame } from '../systems/persistence.js';
import { EtatPartie } from '../models/enums.js';

// ===== GAME MANAGER =====

export class GameManager {
    constructor(config) {
        this.config = config;
        this.tour = 1;
        this.niveauVictoire = config.victoryLevel;
        this.guildes = [];
        this.nomGuildeJoueur = '';
        this.missionsGlobales = [];
        this.candidatsRecrutement = [];
        this.rapportsIA = [];
    }

    // Initialise une nouvelle partie
    initialiserJeu() {
        // Générer les guildes (1 joueur + 2 IA)
        this.guildes = generateGuilds(3, this.config.nbAdventurerPerGuild, this.config.goldStart);
        this.nomGuildeJoueur = this.guildes[0].nom;

        // Générer les missions du premier tour
        this.genererMissionsGlobales();

        // Générer les premiers candidats
        this.genererCandidatsRecrutement();
    }

    // Charge une partie sauvegardée
    chargerPartie() {
        const result = loadGame();
        if (result.success) {
            const state = result.gameState;
            this.tour = state.tour;
            this.niveauVictoire = state.niveauVictoire;
            this.nomGuildeJoueur = state.nomGuildeJoueur;
            this.guildes = state.guildes;
            this.missionsGlobales = state.missionsGlobales;
            this.candidatsRecrutement = state.candidatsRecrutement;
            return true;
        }
        return false;
    }

    // Sauvegarde la partie
    sauvegarderPartie() {
        return saveGame({
            tour: this.tour,
            niveauVictoire: this.niveauVictoire,
            nomGuildeJoueur: this.nomGuildeJoueur,
            guildes: this.guildes,
            missionsGlobales: this.missionsGlobales,
            candidatsRecrutement: this.candidatsRecrutement
        });
    }

    // Récupère la guilde du joueur
    getGuildeJoueur() {
        return this.guildes.find(g => g.nom === this.nomGuildeJoueur) || null;
    }

    // Récupère les guildes IA
    getGuildesIA() {
        return this.guildes.filter(g => g.isIA);
    }

    // Génère les missions pour ce tour
    genererMissionsGlobales() {
        this.missionsGlobales = generateTurnMissions(this.tour, 5 + Math.floor(this.tour / 2));
    }

    // Génère les candidats de recrutement
    genererCandidatsRecrutement() {
        const niveauMoyen = Math.min(5, 1 + Math.floor(this.tour / 3));
        this.candidatsRecrutement = generateRecruitCandidates(4, niveauMoyen);
    }

    // Récupère les missions disponibles
    getMissionsDisponibles() {
        return this.missionsGlobales.filter(m => m.disponible);
    }

    // Exécute une mission pour le joueur
    executerMission(mission, equipe) {
        // Marquer la mission comme effectuée
        mission.marquerEffectuee();

        // Résoudre la mission
        const rapport = resolveMission(mission, equipe);
        rapport.nomGuilde = this.nomGuildeJoueur;

        // Appliquer les résultats à la guilde du joueur
        const guild = this.getGuildeJoueur();
        applyMissionResults(guild, rapport);

        return rapport;
    }

    // Recrute un candidat
    recruterCandidat(index) {
        if (index < 0 || index >= this.candidatsRecrutement.length) {
            return { success: false, error: 'Index invalide' };
        }

        const candidat = this.candidatsRecrutement[index];
        const cout = calculateRecruitCost(candidat);
        const guild = this.getGuildeJoueur();

        if (!guild.peutPayer(cout)) {
            return { success: false, error: 'Pas assez d\'or' };
        }

        guild.payerOr(cout);
        guild.ajouterAventurier(candidat);

        // Retirer le candidat de la liste
        this.candidatsRecrutement.splice(index, 1);

        return { success: true, candidat, cout };
    }

    // Soigne un aventurier
    soignerAventurier(nomAventurier) {
        const guild = this.getGuildeJoueur();
        const aventurier = guild.chercherAventurier(nomAventurier);

        if (!aventurier) {
            return { success: false, error: 'Aventurier non trouvé' };
        }

        if (!aventurier.isBesse()) {
            return { success: false, error: 'Cet aventurier n\'est pas blessé' };
        }

        // Calcul du coût selon gravité
        let cout = 50;
        const blessure = aventurier.etat.blessure;
        if (['Blessure Critique', 'Membre Brisé', 'Hémorragie', 'Paralysé Partiel'].includes(blessure)) {
            cout = 300;
        } else if (['Fracture Grave', 'Brûlure Grave', 'Coupure Profonde', 'Empoisonné'].includes(blessure)) {
            cout = 150;
        }

        if (!guild.peutPayer(cout)) {
            return { success: false, error: 'Pas assez d\'or', cout };
        }

        guild.payerOr(cout);
        aventurier.soigner();

        return { success: true, cout };
    }

    // Lance le tour suivant
    lancerTourSuivant() {
        this.tour++;

        // Générer nouvelles missions
        this.genererMissionsGlobales();

        // Générer nouveaux candidats
        this.genererCandidatsRecrutement();

        // Exécuter tours des IA
        this.rapportsIA = executeAllIATurns(this.getGuildesIA(), this.missionsGlobales);

        return this.rapportsIA;
    }

    // Vérifie les conditions de fin de partie
    verifierConditionsPartie() {
        const guild = this.getGuildeJoueur();

        if (!guild) return EtatPartie.DEFAITE;

        // Victoire: niveau moyen >= niveau victoire
        if (guild.getNiveauMoyen() >= this.niveauVictoire) {
            return EtatPartie.VICTOIRE;
        }

        // Défaite: plus d'aventuriers et plus d'or pour recruter
        if (guild.estDecimee() && guild.or < 100) {
            return EtatPartie.DEFAITE;
        }

        // En cours
        return EtatPartie.EN_COURS;
    }

    // Récupère l'état de la partie
    getEtatPartie() {
        return {
            tour: this.tour,
            niveauVictoire: this.niveauVictoire,
            etat: this.verifierConditionsPartie()
        };
    }
}
