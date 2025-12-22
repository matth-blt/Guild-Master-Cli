import { StatutMission, TagMission, Classe, Blessures, Rarete } from '../models/enums.js';
import { generateRandomItem } from '../models/item.js';

// ===== MISSION SIMULATION SYSTEM =====

// Calcule le bonus de classe contre certains tags
function getClasseTagBonus(classe, tags) {
    let bonus = 0;

    // Voleur: bonus contre Pièges, Stealth, Embuscade
    if (classe === Classe.VOLEUR) {
        if (tags.includes(TagMission.PIEGES)) bonus += 20;
        if (tags.includes(TagMission.STEALTH)) bonus += 25;
        if (tags.includes(TagMission.EMBUSCADE)) bonus += 15;
    }

    // Mage: bonus contre Magie et Élémentaire
    if (classe === Classe.MAGE) {
        if (tags.includes(TagMission.MAGIE)) bonus += 25;
        if (tags.includes(TagMission.ELEMENTAIRE)) bonus += 20;
    }

    // Prêtre: bonus contre Non-Morts et Longue Mission
    if (classe === Classe.HEALER) {
        if (tags.includes(TagMission.NON_MORTS)) bonus += 25;
        if (tags.includes(TagMission.LONGUE_MISSION)) bonus += 15;
    }

    // Guerrier/Tank: bonus contre Boss et Combat
    if (classe === Classe.GUERRIER || classe === Classe.TANK) {
        if (tags.includes(TagMission.BOSS)) bonus += 20;
        if (tags.includes(TagMission.COMBAT)) bonus += 15;
    }

    return bonus;
}

// Calcule la puissance effective d'une équipe contre une mission
function calculateTeamPower(equipe, mission) {
    let puissanceBase = 0;
    let bonusTags = 0;

    for (const aventurier of equipe) {
        if (!aventurier.isDisponible()) continue;

        puissanceBase += aventurier.getPuissance();
        bonusTags += getClasseTagBonus(aventurier.classe, mission.tags);
    }

    return puissanceBase + bonusTags;
}

// Calcule la difficulté requise pour une mission
function getMissionDifficultyThreshold(mission) {
    const base = mission.difficulte * 50;
    const tagModifier = mission.tags.length * 10;
    return base + tagModifier;
}

// Génère une blessure aléatoire selon la gravité
function getRandomBlessure(gravite) {
    const blessuresLegeres = [
        Blessures.EGRATIGNURE,
        Blessures.COUPURE_LEGERE,
        Blessures.BRULURE_LEGERE
    ];

    const blessuresGraves = [
        Blessures.COUPURE_PROFONDE,
        Blessures.FRACTURE_GRAVE,
        Blessures.BRULURE_GRAVE,
        Blessures.EMPOISONNE
    ];

    const blessuresCritiques = [
        Blessures.BLESSURE_CRITIQUE,
        Blessures.MEMBRE_BRISE,
        Blessures.HEMORRAGIE,
        Blessures.PARALYSE_PARTIEL
    ];

    const pool = gravite === 'critique' ? blessuresCritiques :
        gravite === 'grave' ? blessuresGraves : blessuresLegeres;

    return pool[Math.floor(Math.random() * pool.length)];
}

// Résout une mission et retourne un rapport
export function resolveMission(mission, equipe) {
    const rapport = {
        nomMission: mission.nom,
        statut: StatutMission.ECHEC,
        orGagne: 0,
        reputationGagnee: 0,
        itemsGagnes: [],
        aventuriersMorts: [],
        aventuriersBlesses: [],
        changements: []
    };

    // Vérifier que l'équipe n'est pas vide
    const equipeDispo = equipe.filter(a => a.isDisponible());
    if (equipeDispo.length === 0) {
        return rapport;
    }

    // Calcul des puissances
    const puissanceEquipe = calculateTeamPower(equipeDispo, mission);
    const seuilDifficulte = getMissionDifficultyThreshold(mission);

    // Ratio de succès
    const ratio = puissanceEquipe / seuilDifficulte;
    const chanceSucces = Math.min(95, Math.max(5, ratio * 60 + 20));
    const roll = Math.random() * 100;

    // Détermination du résultat
    if (roll < chanceSucces) {
        // Succès complet ou partiel
        if (ratio >= 1.2) {
            rapport.statut = StatutMission.SUCCES_COMPLET;
        } else {
            rapport.statut = ratio >= 0.8 ? StatutMission.SUCCES_COMPLET : StatutMission.SUCCES_PARTIEL;
        }
    } else {
        rapport.statut = StatutMission.ECHEC;
    }

    // Calcul des récompenses
    const succes = rapport.statut !== StatutMission.ECHEC;
    const partiel = rapport.statut === StatutMission.SUCCES_PARTIEL;

    rapport.orGagne = mission.genererRecompenseOr(succes, partiel);
    rapport.reputationGagnee = mission.genererRecompenseReputation(succes, partiel);

    // Items gagnés en cas de succès
    if (succes && mission.recompenses.nombreItemsPossibles > 0) {
        const nbItems = partiel ? 1 : Math.min(2, mission.recompenses.nombreItemsPossibles);
        const rarete = mission.recompenses.raretesItems[0] || Rarete.COMMUN;

        for (let i = 0; i < nbItems; i++) {
            if (Math.random() < 0.3 + (mission.difficulte * 0.05)) {
                rapport.itemsGagnes.push(generateRandomItem(rarete));
            }
        }
    }

    // Blessures et morts
    for (const aventurier of equipeDispo) {
        const risqueDanger = (mission.difficulte * 8) - (aventurier.stats.defense * 0.5) - (aventurier.stats.chance.esquive);
        const rollDanger = Math.random() * 100;

        if (rollDanger < risqueDanger) {
            // L'aventurier est touché
            const graviteRoll = Math.random() * 100;

            if (graviteRoll < 5 + mission.difficulte * 2 && rapport.statut === StatutMission.ECHEC) {
                // Mort
                aventurier.tuer();
                rapport.aventuriersMorts.push(aventurier.name);
                rapport.changements.push({
                    nomAventurier: aventurier.name,
                    mort: true,
                    blesse: false,
                    fuite: false,
                    gainExperience: 0
                });
            } else if (graviteRoll < 30) {
                // Blessure critique
                const blessure = getRandomBlessure('critique');
                aventurier.blesser(blessure);
                rapport.aventuriersBlesses.push(aventurier.name);
                rapport.changements.push({
                    nomAventurier: aventurier.name,
                    mort: false,
                    blesse: true,
                    blessure,
                    fuite: false,
                    gainExperience: succes ? 50 : 10
                });
            } else if (graviteRoll < 60) {
                // Blessure grave
                const blessure = getRandomBlessure('grave');
                aventurier.blesser(blessure);
                rapport.aventuriersBlesses.push(aventurier.name);
                rapport.changements.push({
                    nomAventurier: aventurier.name,
                    mort: false,
                    blesse: true,
                    blessure,
                    fuite: false,
                    gainExperience: succes ? 50 : 10
                });
            } else {
                // Blessure légère
                const blessure = getRandomBlessure('legere');
                aventurier.blesser(blessure);
                rapport.aventuriersBlesses.push(aventurier.name);
                rapport.changements.push({
                    nomAventurier: aventurier.name,
                    mort: false,
                    blesse: true,
                    blessure,
                    fuite: false,
                    gainExperience: succes ? 70 : 20
                });
            }
        } else {
            // Aventurier indemne
            rapport.changements.push({
                nomAventurier: aventurier.name,
                mort: false,
                blesse: false,
                fuite: false,
                gainExperience: succes ? 100 : 25
            });
        }
    }

    // Appliquer XP aux survivants non morts
    for (const change of rapport.changements) {
        if (!change.mort && change.gainExperience > 0) {
            const aventurier = equipe.find(a => a.name === change.nomAventurier);
            if (aventurier) {
                aventurier.gainExperience(change.gainExperience);
            }
        }
    }

    return rapport;
}

// Applique les résultats d'une mission à une guilde
export function applyMissionResults(guild, rapport) {
    // Or et réputation
    guild.gagnerOr(rapport.orGagne);
    guild.modifierReputation(rapport.reputationGagnee);

    // Items
    for (const item of rapport.itemsGagnes) {
        guild.ajouterItem(item);
    }

    // Retirer les morts
    for (const nomMort of rapport.aventuriersMorts) {
        guild.retirerAventurier(nomMort);
    }
}
