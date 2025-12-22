import { StatutMission, TagMission, Classe, Blessures, Rarete, Personality } from '../models/enums.js';
import { generateRandomItem } from '../models/item.js';

// ===== ENHANCED MISSION SIMULATION SYSTEM =====
// Based on C++ logic with bug fixes and simplifications

// ===== BONUS SYNERGIE =====

// Calcule le bonus de synergie d'équipe (Tank+Healer+DPS = +15%)
function calculateSynergyBonus(equipe) {
    if (equipe.length < 2) return 0;

    // Compter les classes présentes
    const classes = new Set(equipe.map(a => a.classe));
    let bonusVariete = classes.size * 0.05; // 5% par classe différente

    // Bonus équipe équilibrée
    const hasTank = equipe.some(a => a.classe === Classe.TANK);
    const hasHealer = equipe.some(a => a.classe === Classe.HEALER);
    const hasDPS = equipe.some(a =>
        a.classe === Classe.MAGE ||
        a.classe === Classe.GUERRIER ||
        a.classe === Classe.VOLEUR
    );

    const bonusEquilibre = (hasTank && hasHealer && hasDPS) ? 0.15 : 0;

    return bonusVariete + bonusEquilibre;
}

// ===== BONUS TAGS PAR CLASSE =====

function calculateTagBonus(equipe, tags) {
    let bonus = 0;

    // Compter les classes
    const nbClasses = {};
    for (const a of equipe) {
        nbClasses[a.classe] = (nbClasses[a.classe] || 0) + 1;
    }

    const nbMages = nbClasses[Classe.MAGE] || 0;
    const nbGuerriers = nbClasses[Classe.GUERRIER] || 0;
    const nbTanks = nbClasses[Classe.TANK] || 0;
    const nbHealers = nbClasses[Classe.HEALER] || 0;
    const nbVoleurs = nbClasses[Classe.VOLEUR] || 0;
    const nbVillageois = nbClasses[Classe.VILLAGEOIS] || 0;

    for (const tag of tags) {
        switch (tag) {
            case TagMission.PIEGES:
                if (nbVoleurs > 0) bonus += 0.25;
                if (nbTanks > 0 || nbGuerriers > 1) bonus -= 0.10;
                break;

            case TagMission.STEALTH:
                if (nbVoleurs > 0) bonus += 0.25;
                if (nbTanks > 0) bonus -= 0.15;
                break;

            case TagMission.BOSS:
            case TagMission.COMBAT:
                bonus += (nbGuerriers * 0.20) + (nbTanks * 0.15);
                if (nbVillageois > 0) bonus -= 0.15;
                break;

            case TagMission.MAGIE:
            case TagMission.ELEMENTAIRE:
                if (nbMages > 0) bonus += 0.30;
                else bonus -= 0.20;
                break;

            case TagMission.LONGUE_MISSION:
                if (nbHealers > 0) bonus += 0.25;
                if (nbHealers > 1) bonus += 0.15;
                if (nbHealers === 0) bonus -= 0.15;
                break;

            case TagMission.NON_MORTS:
                if (nbMages > 0) bonus += 0.20;
                if (nbHealers > 0) bonus += 0.15;
                break;

            case TagMission.EMBUSCADE:
                if (nbVoleurs > 0) bonus += 0.20;
                if (nbTanks > 0) bonus += 0.15;
                break;
        }
    }

    return bonus;
}

// ===== COMPORTEMENTS PERSONNALITÉ =====

// Vérifie si un aventurier fuit
function checkFuite(aventurier, equipe, phaseEchouee) {
    const personality = aventurier.personality;

    // Ratio PV (FIX du bug C++)
    const ratioHP = aventurier.stats.pv / aventurier.stats.pvMax;
    const pvBas = ratioHP < 0.3;

    // Compter les morts
    const nombreMorts = equipe.filter(a => !a.etat.vivant).length;
    const equipeDecimee = nombreMorts > equipe.length / 2;

    // Probabilités selon personnalité
    let chanceFuite = 0;

    if (personality === Personality.LACHE) {
        chanceFuite = 40;
        if (pvBas) chanceFuite += 30;
        if (phaseEchouee) chanceFuite += 15;
    } else if (personality === Personality.OPPORTUNISTE && equipeDecimee) {
        chanceFuite = 35;
    } else if (pvBas && phaseEchouee) {
        chanceFuite = 15; // Tout le monde peut fuir si situation désespérée
    }

    return Math.random() * 100 < chanceFuite;
}

// Vérifie si un aventurier protège un allié
function checkProtection(aventurier, equipe) {
    const personality = aventurier.personality;

    if (personality !== Personality.LOYAL && personality !== Personality.HEROIQUE) {
        return null;
    }

    // Chercher un allié en danger (FIX du bug C++)
    const allieEnDanger = equipe.find(membre =>
        membre.name !== aventurier.name &&
        membre.etat.vivant &&
        (membre.stats.pv / membre.stats.pvMax) < 0.2
    );

    if (!allieEnDanger) return null;

    const chanceProtection = personality === Personality.HEROIQUE ? 70 : 50;

    if (Math.random() * 100 < chanceProtection) {
        return allieEnDanger.name;
    }
    return null;
}

// Vérifie si un aventurier vole du butin
function checkVol(aventurier, hasRareLoot) {
    if (!hasRareLoot) return false;

    const personality = aventurier.personality;

    if (personality === Personality.CUPIDE) {
        return Math.random() * 100 < 30;
    }
    if (personality === Personality.OPPORTUNISTE) {
        return Math.random() * 100 < 15;
    }
    return false;
}

// Vérifie si un aventurier se sacrifie
function checkSacrifice(aventurier, equipe, situationCritique) {
    if (!situationCritique) return false;

    const personality = aventurier.personality;

    if (personality !== Personality.HEROIQUE && personality !== Personality.COURAGEUX) {
        return false;
    }

    const survivants = equipe.filter(a => a.etat.vivant).length;
    if (survivants <= 1) return false;

    const chanceSacrifice = personality === Personality.HEROIQUE ? 40 : 20;
    return Math.random() * 100 < chanceSacrifice;
}

// ===== GÉNÉRATION BLESSURES =====

function getRandomBlessure(gravite) {
    const pools = {
        legere: [Blessures.EGRATIGNURE, Blessures.COUPURE_LEGERE, Blessures.BRULURE_LEGERE],
        grave: [Blessures.COUPURE_PROFONDE, Blessures.FRACTURE_GRAVE, Blessures.BRULURE_GRAVE, Blessures.EMPOISONNE],
        critique: [Blessures.BLESSURE_CRITIQUE, Blessures.MEMBRE_BRISE, Blessures.HEMORRAGIE, Blessures.PARALYSE_PARTIEL]
    };
    const pool = pools[gravite] || pools.legere;
    return pool[Math.floor(Math.random() * pool.length)];
}

// ===== SIMULATION PHASE =====

function simulatePhase(phase, puissanceEquipe, difficulte) {
    const chanceBase = 50;
    const bonusPuissance = Math.floor(puissanceEquipe / 50);
    const malusDifficulte = difficulte * 5;

    let chanceReussite = chanceBase + bonusPuissance - malusDifficulte;
    chanceReussite = Math.max(5, Math.min(95, chanceReussite));

    return Math.random() * 100 < chanceReussite;
}

// ===== RÉSOLUTION PRINCIPALE =====

export function resolveMission(mission, equipe) {
    const rapport = {
        nomMission: mission.nom,
        statut: StatutMission.ECHEC,
        orGagne: 0,
        reputationGagnee: 0,
        itemsGagnes: [],
        aventuriersMorts: [],
        aventuriersBlesses: [],
        aventuriersFuis: [],
        evenements: [],
        changements: []
    };

    // Filtrer les aventuriers disponibles
    const equipeDispo = equipe.filter(a => a.isDisponible());
    if (equipeDispo.length === 0) return rapport;

    // Calcul puissance avec bonus
    let puissanceBase = equipeDispo.reduce((sum, a) => sum + a.getPuissance(), 0);
    const bonusSynergie = calculateSynergyBonus(equipeDispo);
    const bonusTags = calculateTagBonus(equipeDispo, mission.tags);
    const puissanceTotale = puissanceBase * (1 + bonusSynergie + bonusTags);

    // Générer les phases (simplifié: 2 phases max)
    const phases = [{ nom: 'Approche', difficulte: mission.difficulte - 1 }];

    if (mission.tags.includes(TagMission.BOSS) || mission.difficulte >= 7) {
        phases.push({ nom: 'Combat de Boss', difficulte: mission.difficulte + 2 });
    } else {
        phases.push({ nom: 'Combat final', difficulte: mission.difficulte });
    }

    // Simuler chaque phase
    let phasesReussies = 0;
    let situationCritique = false;

    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const reussie = simulatePhase(phase, puissanceTotale, phase.difficulte);

        if (reussie) {
            phasesReussies++;
            rapport.evenements.push(`${phase.nom} - Réussite!`);
        } else {
            rapport.evenements.push(`${phase.nom} - Échec...`);
            situationCritique = (i === phases.length - 1); // Dernière phase échouée
        }

        // Gérer les comportements IA des aventuriers
        for (const aventurier of equipeDispo) {
            if (!aventurier.etat.vivant || aventurier.etat.aFui) continue;

            // 1. Sacrifice héroïque (priorité max)
            if (situationCritique && checkSacrifice(aventurier, equipeDispo, true)) {
                aventurier.tuer();
                rapport.evenements.push(`${aventurier.name} se sacrifie héroïquement!`);
                rapport.aventuriersMorts.push(aventurier.name);
                rapport.changements.push({
                    nomAventurier: aventurier.name,
                    mort: true,
                    sacrifice: true,
                    gainExperience: 100
                });
                // Le sacrifice sauve la phase
                phasesReussies++;
                situationCritique = false;
                continue;
            }

            // 2. Fuite
            if (checkFuite(aventurier, equipeDispo, !reussie)) {
                aventurier.etat.aFui = true;
                rapport.evenements.push(`${aventurier.name} prend la fuite!`);
                rapport.aventuriersFuis.push(aventurier.name);
                continue;
            }

            // 3. Protection d'allié
            const allieProtege = checkProtection(aventurier, equipeDispo);
            if (allieProtege) {
                rapport.evenements.push(`${aventurier.name} protège ${allieProtege}!`);
                // 30% de chance de blessure en protégeant
                if (Math.random() < 0.3) {
                    const blessure = getRandomBlessure('grave');
                    aventurier.blesser(blessure);
                    rapport.aventuriersBlesses.push(aventurier.name);
                }
            }
        }

        // Appliquer conséquences de la phase
        if (!reussie) {
            for (const aventurier of equipeDispo) {
                if (!aventurier.etat.vivant || aventurier.etat.aFui) continue;

                const tirage = Math.random() * 100;

                if (tirage < 10) {
                    // Mort (10%)
                    aventurier.tuer();
                    rapport.aventuriersMorts.push(aventurier.name);
                    rapport.changements.push({
                        nomAventurier: aventurier.name,
                        mort: true,
                        gainExperience: 0
                    });
                } else if (tirage < 30) {
                    // Blessure (20%)
                    const gravite = tirage < 13 ? 'critique' : tirage < 20 ? 'grave' : 'legere';
                    const blessure = getRandomBlessure(gravite);
                    aventurier.blesser(blessure);
                    rapport.aventuriersBlesses.push(aventurier.name);
                    rapport.changements.push({
                        nomAventurier: aventurier.name,
                        blesse: true,
                        blessure,
                        gainExperience: 10
                    });
                }
            }
        }
    }

    // Déterminer le statut
    const tauxReussite = phasesReussies / phases.length;
    const nombreMorts = equipeDispo.filter(a => !a.etat.vivant).length;
    const nombreFuites = equipeDispo.filter(a => a.etat.aFui).length;

    if ((nombreMorts + nombreFuites) > equipeDispo.length / 2) {
        rapport.statut = StatutMission.ECHEC;
    } else if (tauxReussite >= 0.9 && nombreMorts === 0) {
        rapport.statut = StatutMission.SUCCES_COMPLET;
    } else if (tauxReussite >= 0.5) {
        rapport.statut = StatutMission.SUCCES_PARTIEL;
    } else {
        rapport.statut = StatutMission.ECHEC;
    }

    // Récompenses
    const succes = rapport.statut !== StatutMission.ECHEC;
    const partiel = rapport.statut === StatutMission.SUCCES_PARTIEL;

    rapport.orGagne = mission.genererRecompenseOr(succes, partiel);
    rapport.reputationGagnee = mission.genererRecompenseReputation(succes, partiel);

    // Items et vol de butin
    if (succes && mission.recompenses.nombreItemsPossibles > 0) {
        const hasRareLoot = Math.random() < 0.3;
        const nbItems = partiel ? 1 : Math.min(2, mission.recompenses.nombreItemsPossibles);
        const rarete = mission.recompenses.raretesItems[0] || Rarete.COMMUN;

        for (let i = 0; i < nbItems; i++) {
            if (Math.random() < 0.3 + (mission.difficulte * 0.05)) {
                rapport.itemsGagnes.push(generateRandomItem(rarete));
            }
        }

        // Vérifier vol de butin
        for (const aventurier of equipeDispo) {
            if (aventurier.etat.vivant && !aventurier.etat.aFui && hasRareLoot) {
                if (checkVol(aventurier, true)) {
                    aventurier.etat.aFui = true;
                    rapport.evenements.push(`${aventurier.name} disparaît avec un objet rare!`);
                    rapport.aventuriersFuis.push(aventurier.name);
                    // Retire un item
                    if (rapport.itemsGagnes.length > 0) {
                        rapport.itemsGagnes.pop();
                    }
                    break; // Un seul voleur
                }
            }
        }
    }

    // Appliquer XP aux survivants
    const xpBase = succes ? 100 : 25;
    for (const aventurier of equipeDispo) {
        if (aventurier.etat.vivant && !aventurier.etat.aFui) {
            aventurier.gainExperience(xpBase);
        }
    }

    return rapport;
}

// Applique les résultats d'une mission à une guilde
export function applyMissionResults(guild, rapport) {
    guild.gagnerOr(rapport.orGagne);
    guild.modifierReputation(rapport.reputationGagnee);

    for (const item of rapport.itemsGagnes) {
        guild.ajouterItem(item);
    }

    for (const nomMort of rapport.aventuriersMorts) {
        guild.retirerAventurier(nomMort);
    }
}
