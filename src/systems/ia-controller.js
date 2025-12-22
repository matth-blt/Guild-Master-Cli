import { resolveMission, applyMissionResults } from './simulation.js';
import { generateTurnMissions } from './random.js';

// ===== IA GUILD CONTROLLER =====

// Sélectionne la meilleure mission pour une guilde IA
function selectBestMission(guild, missionsDisponibles) {
    if (missionsDisponibles.length === 0) return null;

    const puissanceTotale = guild.getPuissanceTotale();
    const aventuriersDispos = guild.getAventuriersVivants();

    if (aventuriersDispos.length === 0) return null;

    // Score chaque mission
    const missionsScored = missionsDisponibles.map(mission => {
        let score = 0;

        // Score basé sur le rapport récompense/difficulté
        const recompenseMoyenne = mission.calculerOrMoyen();
        score += recompenseMoyenne / mission.difficulte;

        // Bonus si la puissance est suffisante
        const seuilRecommande = mission.difficulte * 50 * Math.min(4, aventuriersDispos.length);
        if (puissanceTotale >= seuilRecommande) {
            score += 50;
        } else if (puissanceTotale >= seuilRecommande * 0.8) {
            score += 20;
        }

        // Ajustement selon agressivité/prudence de la guilde
        if (mission.difficulte >= 7) {
            score += (guild.agressivite - 50) * 0.5;
            score -= (guild.prudence - 50) * 0.3;
        } else if (mission.difficulte <= 3) {
            score += (guild.prudence - 50) * 0.3;
        }

        return { mission, score };
    });

    // Tri par score décroissant
    missionsScored.sort((a, b) => b.score - a.score);

    // Sélection avec un peu d'aléatoire
    const topMissions = missionsScored.slice(0, 3);
    if (topMissions.length === 0) return null;

    return topMissions[Math.floor(Math.random() * topMissions.length)].mission;
}

// Sélectionne les meilleurs aventuriers pour une mission
function selectTeamForMission(guild, mission, maxSize = 4) {
    const aventuriersDispos = guild.getAventuriersVivants()
        .filter(a => !a.isBesse()); // Ne pas envoyer les blessés

    if (aventuriersDispos.length === 0) return [];

    // Trier par pertinence pour la mission
    const aventuriersScored = aventuriersDispos.map(a => {
        let score = a.getPuissance();

        // Bonus pour les classes adaptées aux tags de la mission
        if (mission.tags.includes('Pièges') && a.classe === 'Voleur') score += 30;
        if (mission.tags.includes('Magie') && a.classe === 'Mage') score += 30;
        if (mission.tags.includes('Non-Morts') && a.classe === 'Prêtre') score += 30;
        if (mission.tags.includes('Boss') && (a.classe === 'Guerrier' || a.classe === 'Tank')) score += 30;
        if (mission.tags.includes('Discrétion') && a.classe === 'Voleur') score += 30;

        return { aventurier: a, score };
    });

    // Trier par score et prendre les meilleurs
    aventuriersScored.sort((a, b) => b.score - a.score);

    const tailleEquipe = Math.min(maxSize, aventuriersScored.length, Math.max(2, Math.ceil(mission.difficulte / 2)));

    return aventuriersScored.slice(0, tailleEquipe).map(s => s.aventurier);
}

// Exécute un tour pour une guilde IA
export function executeIATurn(guild, missionsDisponibles) {
    const rapports = [];

    // Essayer de faire 1-2 missions par tour
    const nbMissionsATenter = Math.min(2, Math.ceil(guild.agressivite / 40));

    for (let i = 0; i < nbMissionsATenter; i++) {
        // Filtrer les missions encore disponibles
        const missionsDispo = missionsDisponibles.filter(m => m.disponible);
        if (missionsDispo.length === 0) break;

        // Sélectionner une mission
        const mission = selectBestMission(guild, missionsDispo);
        if (!mission) break;

        // Sélectionner une équipe
        const equipe = selectTeamForMission(guild, mission);
        if (equipe.length === 0) break;

        // Marquer la mission comme prise
        mission.marquerEffectuee();

        // Résoudre la mission
        const rapport = resolveMission(mission, equipe);
        rapport.nomGuilde = guild.nom;

        // Appliquer les résultats
        applyMissionResults(guild, rapport);

        rapports.push(rapport);

        // Arrêter si la guilde n'a plus assez d'aventuriers
        if (guild.getAventuriersVivants().length <= 2) break;
    }

    return rapports;
}

// Exécute les tours de toutes les guildes IA
export function executeAllIATurns(guildesIA, missionsGlobales) {
    const tousRapports = [];

    for (const guild of guildesIA) {
        if (!guild.isIA) continue;

        const rapports = executeIATurn(guild, missionsGlobales);
        tousRapports.push(...rapports);
    }

    return tousRapports;
}
