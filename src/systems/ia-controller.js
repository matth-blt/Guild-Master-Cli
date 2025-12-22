import { resolveMission, applyMissionResults } from './simulation.js';
import { generateTurnMissions } from './random.js';

/**
 * AI controller for rival guilds
 * @module systems/ia-controller
 */

/**
 * Selects the best mission for an AI guild based on scoring
 * @param {Guild} guild - AI guild
 * @param {Mission[]} missionsDisponibles - Available missions
 * @returns {Mission|null} Selected mission or null
 * @private
 */
function selectBestMission(guild, missionsDisponibles) {
    if (missionsDisponibles.length === 0) return null;

    const puissanceTotale = guild.getPuissanceTotale();
    const aventuriersDispos = guild.getAventuriersVivants();

    if (aventuriersDispos.length === 0) return null;

    const missionsScored = missionsDisponibles.map(mission => {
        let score = 0;

        // Score based on reward/difficulty ratio
        const recompenseMoyenne = mission.calculerOrMoyen();
        score += recompenseMoyenne / mission.difficulte;

        // Bonus if power is sufficient
        const seuilRecommande = mission.difficulte * 50 * Math.min(4, aventuriersDispos.length);
        if (puissanceTotale >= seuilRecommande) {
            score += 50;
        } else if (puissanceTotale >= seuilRecommande * 0.8) {
            score += 20;
        }

        // Adjust based on guild personality
        if (mission.difficulte >= 7) {
            score += (guild.agressivite - 50) * 0.5;
            score -= (guild.prudence - 50) * 0.3;
        } else if (mission.difficulte <= 3) {
            score += (guild.prudence - 50) * 0.3;
        }

        return { mission, score };
    });

    missionsScored.sort((a, b) => b.score - a.score);

    // Select from top 3 with some randomness
    const topMissions = missionsScored.slice(0, 3);
    if (topMissions.length === 0) return null;

    return topMissions[Math.floor(Math.random() * topMissions.length)].mission;
}

/**
 * Selects the best team for a mission based on class bonuses
 * @param {Guild} guild - Guild to select from
 * @param {Mission} mission - Target mission
 * @param {number} maxSize - Maximum team size
 * @returns {Adventurer[]} Selected team
 * @private
 */
function selectTeamForMission(guild, mission, maxSize = 4) {
    const aventuriersDispos = guild.getAventuriersVivants().filter(a => !a.isBesse());

    if (aventuriersDispos.length === 0) return [];

    const aventuriersScored = aventuriersDispos.map(a => {
        let score = a.getPuissance();

        // Class bonuses for mission tags
        if (mission.tags.includes('Pièges') && a.classe === 'Voleur') score += 30;
        if (mission.tags.includes('Magie') && a.classe === 'Mage') score += 30;
        if (mission.tags.includes('Non-Morts') && a.classe === 'Prêtre') score += 30;
        if (mission.tags.includes('Boss') && (a.classe === 'Guerrier' || a.classe === 'Tank')) score += 30;
        if (mission.tags.includes('Discrétion') && a.classe === 'Voleur') score += 30;

        return { aventurier: a, score };
    });

    aventuriersScored.sort((a, b) => b.score - a.score);

    const tailleEquipe = Math.min(maxSize, aventuriersScored.length, Math.max(2, Math.ceil(mission.difficulte / 2)));
    return aventuriersScored.slice(0, tailleEquipe).map(s => s.aventurier);
}

/**
 * Executes a turn for an AI guild (1-2 missions based on aggressiveness)
 * @param {Guild} guild - AI guild
 * @param {Mission[]} missionsDisponibles - Available missions
 * @returns {Object[]} Array of mission reports
 */
export function executeIATurn(guild, missionsDisponibles) {
    const rapports = [];
    const nbMissionsATenter = Math.min(2, Math.ceil(guild.agressivite / 40));

    for (let i = 0; i < nbMissionsATenter; i++) {
        const missionsDispo = missionsDisponibles.filter(m => m.disponible);
        if (missionsDispo.length === 0) break;

        const mission = selectBestMission(guild, missionsDispo);
        if (!mission) break;

        const equipe = selectTeamForMission(guild, mission);
        if (equipe.length === 0) break;

        mission.marquerEffectuee();

        const rapport = resolveMission(mission, equipe);
        rapport.nomGuilde = guild.nom;

        applyMissionResults(guild, rapport);
        rapports.push(rapport);

        if (guild.getAventuriersVivants().length <= 2) break;
    }

    return rapports;
}

/**
 * Executes turns for all AI guilds
 * @param {Guild[]} guildesIA - All guilds (will filter for AI only)
 * @param {Mission[]} missionsGlobales - Available missions
 * @returns {Object[]} All mission reports from AI guilds
 */
export function executeAllIATurns(guildesIA, missionsGlobales) {
    const tousRapports = [];

    for (const guild of guildesIA) {
        if (!guild.isIA) continue;
        const rapports = executeIATurn(guild, missionsGlobales);
        tousRapports.push(...rapports);
    }

    return tousRapports;
}
