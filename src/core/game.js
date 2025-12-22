import { generateGuilds, generateRecruitCandidates, generateTurnMissions, calculateRecruitCost } from '../systems/random.js';
import { resolveMission, applyMissionResults } from '../systems/simulation.js';
import { executeAllIATurns } from '../systems/ia-controller.js';
import { saveGame, loadGame } from '../systems/persistence.js';
import { EtatPartie } from '../models/enums.js';

/**
 * Central game orchestrator managing all game state and logic
 * @class GameManager
 */
export class GameManager {
    /**
     * Creates a new GameManager
     * @param {Object} config - Game configuration
     * @param {number} config.victoryLevel - Level required to win
     * @param {number} config.nbAdventurerPerGuild - Adventurers per guild
     * @param {number} config.goldStart - Starting gold
     */
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

    /** Initializes a new game with guilds, missions, and candidates */
    initialiserJeu() {
        this.guildes = generateGuilds(3, this.config.nbAdventurerPerGuild, this.config.goldStart);
        this.nomGuildeJoueur = this.guildes[0].nom;
        this.genererMissionsGlobales();
        this.genererCandidatsRecrutement();
    }

    /**
     * Loads game from save file
     * @returns {boolean} True if loaded successfully
     */
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

    /**
     * Saves current game state
     * @returns {{success: boolean, path?: string, error?: string}} Result
     */
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

    /** @returns {Guild|null} Player's guild */
    getGuildeJoueur() {
        return this.guildes.find(g => g.nom === this.nomGuildeJoueur) || null;
    }

    /** @returns {Guild[]} AI-controlled guilds */
    getGuildesIA() {
        return this.guildes.filter(g => g.isIA);
    }

    /** Generates new missions for current turn */
    genererMissionsGlobales() {
        this.missionsGlobales = generateTurnMissions(this.tour, 5 + Math.floor(this.tour / 2));
    }

    /** Generates new recruitment candidates */
    genererCandidatsRecrutement() {
        const niveauMoyen = Math.min(5, 1 + Math.floor(this.tour / 3));
        this.candidatsRecrutement = generateRecruitCandidates(4, niveauMoyen);
    }

    /** @returns {Mission[]} Available (not completed) missions */
    getMissionsDisponibles() {
        return this.missionsGlobales.filter(m => m.disponible);
    }

    /**
     * Executes a mission with the given team
     * @param {Mission} mission - Mission to execute
     * @param {Adventurer[]} equipe - Team of adventurers
     * @returns {Object} Mission report with results
     */
    executerMission(mission, equipe) {
        mission.marquerEffectuee();
        const rapport = resolveMission(mission, equipe);
        rapport.nomGuilde = this.nomGuildeJoueur;
        const guild = this.getGuildeJoueur();
        applyMissionResults(guild, rapport);
        return rapport;
    }

    /**
     * Recruits a candidate by index
     * @param {number} index - Candidate index
     * @returns {{success: boolean, candidat?: Adventurer, cout?: number, error?: string}} Result
     */
    recruterCandidat(index) {
        if (index < 0 || index >= this.candidatsRecrutement.length) {
            return { success: false, error: 'Invalid index' };
        }

        const candidat = this.candidatsRecrutement[index];
        const cout = calculateRecruitCost(candidat);
        const guild = this.getGuildeJoueur();

        if (!guild.peutPayer(cout)) {
            return { success: false, error: 'Not enough gold' };
        }

        guild.payerOr(cout);
        guild.ajouterAventurier(candidat);
        this.candidatsRecrutement.splice(index, 1);

        return { success: true, candidat, cout };
    }

    /**
     * Heals an injured adventurer
     * @param {string} nomAventurier - Adventurer name
     * @returns {{success: boolean, cout?: number, error?: string}} Result
     */
    soignerAventurier(nomAventurier) {
        const guild = this.getGuildeJoueur();
        const aventurier = guild.chercherAventurier(nomAventurier);

        if (!aventurier) return { success: false, error: 'Adventurer not found' };
        if (!aventurier.isBesse()) return { success: false, error: 'Adventurer is not injured' };

        let cout = 50;
        const blessure = aventurier.etat.blessure;
        if (['Blessure Critique', 'Membre Brisé', 'Hémorragie', 'Paralysé Partiel'].includes(blessure)) {
            cout = 300;
        } else if (['Fracture Grave', 'Brûlure Grave', 'Coupure Profonde', 'Empoisonné'].includes(blessure)) {
            cout = 150;
        }

        if (!guild.peutPayer(cout)) return { success: false, error: 'Not enough gold', cout };

        guild.payerOr(cout);
        aventurier.soigner();
        return { success: true, cout };
    }

    /**
     * Advances to next turn, generates new content, and executes AI turns
     * @returns {Object[]} AI mission reports
     */
    lancerTourSuivant() {
        this.tour++;
        this.genererMissionsGlobales();
        this.genererCandidatsRecrutement();
        this.rapportsIA = executeAllIATurns(this.getGuildesIA(), this.missionsGlobales);
        return this.rapportsIA;
    }

    /**
     * Checks win/lose conditions
     * @returns {string} Game state: VICTOIRE, DEFAITE, or EN_COURS
     */
    verifierConditionsPartie() {
        const guild = this.getGuildeJoueur();
        if (!guild) return EtatPartie.DEFAITE;
        if (guild.getNiveauMoyen() >= this.niveauVictoire) return EtatPartie.VICTOIRE;
        if (guild.estDecimee() && guild.or < 100) return EtatPartie.DEFAITE;
        return EtatPartie.EN_COURS;
    }

    /** @returns {{tour: number, niveauVictoire: number, etat: string}} Current game state */
    getEtatPartie() {
        return { tour: this.tour, niveauVictoire: this.niveauVictoire, etat: this.verifierConditionsPartie() };
    }
}
