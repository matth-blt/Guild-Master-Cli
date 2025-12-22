#!/usr/bin/env node

import { loadConfig } from './src/core/config.js';
import { GameManager } from './src/core/game.js';
import { EtatPartie, TypeItem } from './src/models/enums.js';
import { calculateRecruitCost } from './src/systems/random.js';
import { hasSaveGame, getSaveInfo } from './src/systems/persistence.js';
import { loadLanguage, t, availableLanguages } from './src/i18n/index.js';
import { select } from '@inquirer/prompts';

import {
    displayLogo,
    displayHeader,
    displaySuccess,
    displayError,
    displayWarning,
    displayInfo,
    createSpinner,
    clearScreen,
    displayGuildStats,
    displayAdventurerStats,
    displayMission,
    displayItem,
    displayMissionReport,
    displayVictoryScreen,
    displayDefeatScreen,
    displaySeparator
} from './src/ui/components.js';

import {
    mainMenuPrompt,
    selectAdventurerPrompt,
    selectMultipleAdventurersPrompt,
    selectMissionPrompt,
    selectItemPrompt,
    selectEquipmentTypePrompt,
    selectRecruitPrompt,
    confirmPrompt,
    pressEnterPrompt
} from './src/ui/prompts.js';

import { colors, icons, formatGold, formatReputation, gradients } from './src/ui/theme.js';

// ===== LANGUAGE SELECTION =====

async function selectLanguage() {
    clearScreen();
    displayLogo();

    const lang = await select({
        message: 'Choose your language / Choisissez votre langue',
        choices: availableLanguages.map(l => ({ name: l.name, value: l.code })),
        theme: { prefix: '🌎' }
    });

    loadLanguage(lang);
    return lang;
}

// ===== MAIN GAME LOOP =====

let gameManager = null;

async function displayWelcome() {
    clearScreen();
    displayLogo();

    console.log(gradients.title(`  ${t('welcome.title')}`));
    console.log();
    console.log(`  ${t('welcome.description1')}`);
    console.log(`  ${t('welcome.description2')}`);
    console.log(`  ${t('welcome.description3')}`);
    console.log();

    // Vérifier si une sauvegarde existe
    if (hasSaveGame()) {
        const info = getSaveInfo();
        if (info) {
            displayInfo(t('welcome.saveFound', { name: info.nomGuildeJoueur, turn: info.tour }));
            console.log();

            const charger = await confirmPrompt(t('welcome.loadSave'));
            if (charger) {
                return 'load';
            }
        }
    }

    await pressEnterPrompt(t('welcome.pressEnter'));
    return 'new';
}

async function initializeGame(mode) {
    clearScreen();
    const spinner = createSpinner('Chargement de la configuration...');
    spinner.start();

    const config = loadConfig();
    gameManager = new GameManager(config);

    if (mode === 'load') {
        spinner.text = 'Chargement de la sauvegarde...';
        if (gameManager.chargerPartie()) {
            spinner.succeed('Partie chargée avec succès!');
        } else {
            spinner.warn('Impossible de charger la sauvegarde, nouvelle partie...');
            gameManager.initialiserJeu();
        }
    } else {
        spinner.text = 'Génération du monde...';
        gameManager.initialiserJeu();
        spinner.succeed('Monde généré avec succès!');
    }

    console.log();
    displayInfo(`Votre guilde: ${colors.textBold(gameManager.nomGuildeJoueur)}`);
    displayInfo(`Objectif: Atteindre le niveau moyen ${colors.niveau(gameManager.niveauVictoire)}`);
    console.log();

    await pressEnterPrompt();
}

// ===== ÉCRANS =====

async function ecranGuildeStats() {
    clearScreen();
    displayHeader('STATISTIQUES DES GUILDES');

    for (const guild of gameManager.guildes) {
        displayGuildStats(guild);
    }

    await pressEnterPrompt();
}

async function ecranListeAventuriers() {
    clearScreen();
    const guild = gameManager.getGuildeJoueur();
    const aventuriers = guild.getAventuriersVivants();

    displayHeader('LISTE DES AVENTURIERS');
    displayInfo(`Aventuriers actifs: ${aventuriers.length}`);
    console.log();

    if (aventuriers.length === 0) {
        displayWarning('Aucun aventurier dans la guilde.');
        await pressEnterPrompt();
        return;
    }

    const index = await selectAdventurerPrompt(aventuriers, 'Voir les détails d\'un aventurier');

    if (index !== null) {
        clearScreen();
        displayAdventurerStats(aventuriers[index]);
        await pressEnterPrompt();
    }
}

async function ecranInventaire() {
    clearScreen();
    const guild = gameManager.getGuildeJoueur();

    displayHeader('INVENTAIRE DE LA GUILDE');
    displayInfo(`${formatGold(guild.or)}`);
    console.log();

    if (guild.inventaire.length === 0) {
        displayWarning('L\'inventaire est vide.');
    } else {
        for (const item of guild.inventaire) {
            displayItem(item);
        }
    }

    await pressEnterPrompt();
}

async function ecranMissionsDisponibles() {
    clearScreen();
    const missionsDispos = gameManager.getMissionsDisponibles();

    displayHeader('MISSIONS DISPONIBLES');
    displayInfo(`${missionsDispos.length} missions disponibles`);
    console.log();

    if (missionsDispos.length === 0) {
        displayWarning('Aucune mission disponible pour le moment.');
        await pressEnterPrompt();
        return;
    }

    // Afficher les missions
    for (let i = 0; i < missionsDispos.length; i++) {
        displayMission(missionsDispos[i], i + 1);
    }

    const index = await selectMissionPrompt(missionsDispos, 'Sélectionner une mission');

    if (index !== null) {
        const mission = missionsDispos[index];

        displaySeparator();
        displayMission(mission);

        const confirmer = await confirmPrompt('Assigner des aventuriers à cette mission?');

        if (confirmer) {
            await assignerAventuriersMission(mission);
        }
    }
}

async function assignerAventuriersMission(mission) {
    const guild = gameManager.getGuildeJoueur();
    const aventuriersDispos = guild.getAventuriersVivants().filter(a => !a.isBesse());

    if (aventuriersDispos.length === 0) {
        displayError('Aucun aventurier disponible (tous blessés ou morts).');
        await pressEnterPrompt();
        return;
    }

    clearScreen();
    displayHeader('SÉLECTION D\'ÉQUIPE');
    displayMission(mission);

    try {
        const indices = await selectMultipleAdventurersPrompt(aventuriersDispos, 4, 'Sélectionner votre équipe', mission);

        if (indices.length === 0) {
            displayWarning('Aucun aventurier sélectionné. Mission annulée.');
            await pressEnterPrompt();
            return;
        }

        const equipe = indices.map(i => aventuriersDispos[i]);

        const spinner = createSpinner('Lancement de la mission...');
        spinner.start();

        // Simuler un délai pour l'effet
        await new Promise(resolve => setTimeout(resolve, 1500));

        const rapport = gameManager.executerMission(mission, equipe);
        spinner.stop();

        clearScreen();
        displayMissionReport(rapport);

        await pressEnterPrompt();
    } catch (error) {
        // L'utilisateur a annulé
        displayWarning('Sélection annulée.');
        await pressEnterPrompt();
    }
}

async function ecranRecrutement() {
    clearScreen();
    const guild = gameManager.getGuildeJoueur();

    displayHeader('TAVERNE - RECRUTEMENT');
    displayInfo(`Or disponible: ${formatGold(guild.or)}`);
    console.log();

    const candidats = gameManager.candidatsRecrutement;

    if (candidats.length === 0) {
        displayWarning('Aucun candidat disponible pour l\'instant.');
        displayInfo('De nouveaux aventuriers arriveront au prochain tour.');
        await pressEnterPrompt();
        return;
    }

    // Afficher les candidats
    console.log(colors.textDim('(Le pool se renouvelle chaque tour)\n'));

    for (let i = 0; i < candidats.length; i++) {
        const c = candidats[i];
        const cout = calculateRecruitCost(c);
        console.log(`${colors.primary(`[${i + 1}]`)} ${c.name} - ${c.classe} (Niv. ${c.stats.niveau}) - ${formatGold(cout)}`);
    }
    console.log();

    const index = await selectRecruitPrompt(candidats, guild.or);

    if (index !== null) {
        const candidat = candidats[index];
        const cout = calculateRecruitCost(candidat);

        const confirmer = await confirmPrompt(`Recruter ${candidat.name} pour ${cout} or?`);

        if (confirmer) {
            const result = gameManager.recruterCandidat(index);
            if (result.success) {
                displaySuccess(`${result.candidat.name} a rejoint votre guilde!`);
            } else {
                displayError(result.error);
            }
            await pressEnterPrompt();
        }
    }
}

async function ecranEquipement() {
    clearScreen();
    const guild = gameManager.getGuildeJoueur();
    const aventuriers = guild.getAventuriersVivants();

    displayHeader('ÉQUIPER UN AVENTURIER');

    if (aventuriers.length === 0) {
        displayWarning('Aucun aventurier disponible.');
        await pressEnterPrompt();
        return;
    }

    // Sélectionner un aventurier
    const indexAv = await selectAdventurerPrompt(aventuriers, 'Sélectionner un aventurier');
    if (indexAv === null) return;

    const aventurier = aventuriers[indexAv];

    clearScreen();
    displayAdventurerStats(aventurier);

    // Sélectionner le type d'équipement
    const typeEquip = await selectEquipmentTypePrompt();
    if (!typeEquip) return;

    // Filtrer les items compatibles
    const itemsCompatibles = guild.inventaire.filter(item =>
        item.type === typeEquip &&
        item.estUtilisablePar(aventurier.classe, aventurier.stats.niveau)
    );

    if (itemsCompatibles.length === 0) {
        displayWarning('Aucun équipement compatible dans l\'inventaire.');
        await pressEnterPrompt();
        return;
    }

    // Sélectionner un item
    const indexItem = await selectItemPrompt(itemsCompatibles, 'Choisir un item');
    if (indexItem === null) return;

    const item = itemsCompatibles[indexItem];

    // Appliquer les bonus
    aventurier.stats.attaque += item.bonus.attaque;
    aventurier.stats.defense += item.bonus.defense;
    aventurier.stats.vitesse += item.bonus.vitesse;
    aventurier.stats.chance.critique += item.bonus.critique;
    aventurier.stats.chance.esquive += item.bonus.esquive;

    // Retirer l'item de l'inventaire
    guild.retirerItem(item.nom);

    displaySuccess(`${item.nom} équipé sur ${aventurier.name}!`);
    await pressEnterPrompt();
}

async function ecranInfirmerie() {
    clearScreen();
    const guild = gameManager.getGuildeJoueur();
    const blesses = guild.getAventuriersBesses();

    displayHeader('INFIRMERIE');
    displayInfo(`Or disponible: ${formatGold(guild.or)}`);
    console.log();

    console.log(colors.textDim('Coût des soins par gravité:'));
    console.log('  - Blessure légère: 50 or');
    console.log('  - Blessure grave: 150 or');
    console.log('  - Blessure critique: 300 or');
    console.log();

    if (blesses.length === 0) {
        displaySuccess('Aucun aventurier blessé!');
        await pressEnterPrompt();
        return;
    }

    // Afficher les blessés
    for (const b of blesses) {
        console.log(`${colors.warning(icons.warning)} ${b.name} - ${colors.error(b.etat.blessure)}`);
    }
    console.log();

    const index = await selectAdventurerPrompt(blesses, 'Soigner un aventurier');

    if (index !== null) {
        const result = gameManager.soignerAventurier(blesses[index].name);

        if (result.success) {
            displaySuccess(`${blesses[index].name} a été soigné avec succès! (-${result.cout} or)`);
        } else {
            displayError(result.error + (result.cout ? ` (coût: ${result.cout} or)` : ''));
        }

        await pressEnterPrompt();
    }
}

async function ecranSauvegarde() {
    clearScreen();
    displayHeader('SAUVEGARDE');

    const spinner = createSpinner('Sauvegarde en cours...');
    spinner.start();

    const result = gameManager.sauvegarderPartie();

    if (result.success) {
        spinner.succeed('Partie sauvegardée avec succès!');
        displayInfo(`Fichier: ${result.path}`);
    } else {
        spinner.fail('Erreur lors de la sauvegarde');
        displayError(result.error);
    }

    await pressEnterPrompt();
}

async function ecranChargement() {
    clearScreen();
    displayHeader('CHARGEMENT');

    const confirmer = await confirmPrompt('Charger la dernière sauvegarde? (La progression actuelle sera perdue)');

    if (confirmer) {
        const spinner = createSpinner('Chargement en cours...');
        spinner.start();

        if (gameManager.chargerPartie()) {
            spinner.succeed('Partie chargée avec succès!');
            displayInfo(`Tour: ${gameManager.tour}`);
        } else {
            spinner.fail('Erreur lors du chargement');
            displayError('Vérifiez que le fichier saves/savegame.json existe.');
        }

        await pressEnterPrompt();
    }
}

async function ecranTourSuivant() {
    clearScreen();
    displayHeader(`FIN DU TOUR ${gameManager.tour}`);

    const spinner = createSpinner('Passage au tour suivant...');
    spinner.start();

    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 1000));

    const rapportsIA = gameManager.lancerTourSuivant();
    spinner.succeed(`Tour ${gameManager.tour} commencé!`);

    console.log();

    // Afficher les rapports IA
    if (rapportsIA.length > 0) {
        displayHeader('RAPPORT DES GUILDES RIVALES');

        for (const rapport of rapportsIA) {
            displayMissionReport(rapport);
        }
    } else {
        displayInfo('Aucune guilde rivale n\'a effectué de mission ce tour-ci.');
    }

    console.log();
    displayInfo('Nouvelles missions disponibles.');
    displayInfo('Nouveaux candidats à la taverne.');

    await pressEnterPrompt();
}

// ===== BOUCLE PRINCIPALE =====

async function gameLoop() {
    let continuer = true;

    while (continuer) {
        // Vérifier conditions de fin
        const etat = gameManager.verifierConditionsPartie();

        if (etat === EtatPartie.VICTOIRE) {
            displayVictoryScreen(gameManager.getGuildeJoueur(), gameManager.tour);
            await pressEnterPrompt();
            break;
        } else if (etat === EtatPartie.DEFAITE) {
            displayDefeatScreen(
                gameManager.getGuildeJoueur(),
                gameManager.tour,
                'Plus d\'aventuriers et pas assez d\'or pour recruter'
            );
            await pressEnterPrompt();
            break;
        }

        // Afficher le menu principal
        clearScreen();
        displayLogo();

        const guild = gameManager.getGuildeJoueur();
        console.log(`  Tour: ${colors.primary(gameManager.tour)}  |  Guilde: ${colors.textBold(guild.nom)}  |  ${formatGold(guild.or)}  |  ${formatReputation(guild.reputation)}`);
        console.log(`  Objectif: Niveau moyen ${colors.niveau(gameManager.niveauVictoire)} (actuel: ${colors.niveau(guild.getNiveauMoyen())})`);
        console.log();
        displaySeparator();
        console.log();

        const choix = await mainMenuPrompt();

        switch (choix) {
            case 'guild_stats':
                await ecranGuildeStats();
                break;
            case 'adventurers':
                await ecranListeAventuriers();
                break;
            case 'inventory':
                await ecranInventaire();
                break;
            case 'missions':
                await ecranMissionsDisponibles();
                break;
            case 'recruit':
                await ecranRecrutement();
                break;
            case 'equip':
                await ecranEquipement();
                break;
            case 'infirmary':
                await ecranInfirmerie();
                break;
            case 'save':
                await ecranSauvegarde();
                break;
            case 'load':
                await ecranChargement();
                break;
            case 'next_turn':
                await ecranTourSuivant();
                break;
            case 'quit':
                const quitter = await confirmPrompt('Êtes-vous sûr de vouloir quitter?');
                if (quitter) {
                    continuer = false;
                }
                break;
        }
    }
}

// ===== POINT D'ENTRÉE =====

async function main() {
    try {
        // Sélection de la langue au démarrage
        await selectLanguage();

        const mode = await displayWelcome();
        await initializeGame(mode);
        await gameLoop();

        clearScreen();
        displayLogo();
        console.log(gradients.title(`  ${t('common.thanks')}`));
        console.log();
        console.log(`  ${t('common.goodbye')}`);
        console.log();
    } catch (error) {
        if (error.message?.includes('User force closed')) {
            // Ctrl+C
            console.log('\n');
            console.log(colors.textDim(t('common.goodbye')));
        } else {
            console.error('Error:', error);
        }
    }
}

main();

