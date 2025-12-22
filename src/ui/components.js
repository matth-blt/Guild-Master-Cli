import boxen from 'boxen';
import figlet from 'figlet';
import ora from 'ora';
import chalk from 'chalk';
import { gradients, colors, icons, boxStyles, formatGold, formatReputation, formatNiveau, getClasseColor, getRareteColor, progressBar } from './theme.js';

// ===== UI COMPONENTS =====

// Affiche le logo du jeu en ASCII art avec gradient
export function displayLogo() {
    const logo = figlet.textSync('GUILD MASTER', {
        font: 'Standard',
        horizontalLayout: 'default'
    });
    console.log(gradients.title(logo));
    console.log();
}

// Affiche un en-tête stylisé
export function displayHeader(title, style = 'title') {
    const content = gradients.title(title);
    console.log(boxen(content, boxStyles[style] || boxStyles.title));
}

// Affiche un message dans une boîte
export function displayBox(content, style = 'default') {
    console.log(boxen(content, boxStyles[style] || boxStyles.default));
}

// Affiche un message de succès
export function displaySuccess(message) {
    console.log(boxen(
        `${colors.success(icons.success)} ${colors.success(message)}`,
        boxStyles.success
    ));
}

// Affiche un message d'erreur
export function displayError(message) {
    console.log(boxen(
        `${colors.error(icons.error)} ${colors.error(message)}`,
        boxStyles.error
    ));
}

// Affiche un message d'avertissement
export function displayWarning(message) {
    console.log(boxen(
        `${colors.warning(icons.warning)} ${colors.warning(message)}`,
        boxStyles.warning
    ));
}

// Affiche un message d'information
export function displayInfo(message) {
    console.log(`${colors.info(icons.info)} ${message}`);
}

// Crée un spinner de chargement
export function createSpinner(text) {
    return ora({
        text,
        spinner: 'dots',
        color: 'cyan'
    });
}

// Affiche un séparateur
export function displaySeparator(char = '─', length = 60) {
    console.log(colors.textDim(char.repeat(length)));
}

// Efface l'écran
export function clearScreen() {
    console.clear();
}

// Affiche les statistiques d'un aventurier
export function displayAdventurerStats(adventurer) {
    const classeColor = getClasseColor(adventurer.classe);

    let content = '';
    content += `${colors.textBold(adventurer.name)} ${classeColor(`[${adventurer.classe}]`)}\n`;
    content += `${formatNiveau(adventurer.stats.niveau)}\n\n`;

    content += `${colors.pv('PV:')} ${progressBar(adventurer.stats.pv, adventurer.stats.pvMax, 15)} ${adventurer.stats.pv}/${adventurer.stats.pvMax}\n`;
    content += `${colors.attaque(`${icons.sword} ATK:`)} ${adventurer.stats.attaque}  `;
    content += `${colors.defense(`${icons.shield} DEF:`)} ${adventurer.stats.defense}  `;
    content += `${colors.vitesse('VIT:')} ${adventurer.stats.vitesse}\n`;

    content += `\n${colors.textDim('Critique:')} ${adventurer.stats.chance.critique}%  `;
    content += `${colors.textDim('Esquive:')} ${adventurer.stats.chance.esquive}%`;

    if (adventurer.etat.blessure !== 'Aucune') {
        content += `\n\n${colors.error(`${icons.warning} Blessure: ${adventurer.etat.blessure}`)}`;
    }

    console.log(boxen(content, boxStyles.stats));
}

// Affiche les statistiques d'une guilde
export function displayGuildStats(guild) {
    let content = '';
    content += gradients.title(guild.nom) + '\n\n';

    content += `${formatGold(guild.or)}  ${formatReputation(guild.reputation)}\n`;
    content += `${colors.textDim('Statut:')} ${guild.getStatutReputation()}\n\n`;

    const vivants = guild.getAventuriersVivants();
    const blesses = guild.getAventuriersBesses();

    content += `${colors.info('Aventuriers:')} ${vivants.length} actifs`;
    if (blesses.length > 0) {
        content += ` ${colors.warning(`(${blesses.length} blessés)`)}`;
    }
    content += '\n';

    content += `${colors.niveau(`Niveau moyen: ${guild.getNiveauMoyen()}`)}\n`;
    content += `${colors.textDim(`Puissance totale: ${guild.getPuissanceTotale()}`)}`;

    console.log(boxen(content, boxStyles.menu));
}

// Affiche une mission
export function displayMission(mission, index = null) {
    const diffColor = mission.difficulte <= 3 ? colors.success :
        mission.difficulte <= 6 ? colors.warning : colors.error;

    let title = '';
    if (index !== null) title += `${colors.textDim(`[${index}]`)} `;
    title += colors.textBold(mission.nom);

    let content = '';
    content += `${title}\n`;
    content += `${colors.textDim(mission.description)}\n\n`;

    content += `Difficulté: ${diffColor(`${'★'.repeat(mission.difficulte)}${'☆'.repeat(10 - mission.difficulte)}`)} ${diffColor(`(${mission.difficulte}/10)`)}\n`;
    content += `Type: ${colors.info(mission.type)}\n`;

    if (mission.tags.length > 0) {
        content += `Tags: ${mission.tags.map(t => colors.secondary(t)).join(', ')}\n`;
    }

    content += `\n${formatGold(mission.calculerOrMoyen())} (${mission.recompenses.orMin}-${mission.recompenses.orMax})`;
    content += `  ${formatReputation(mission.calculerReputationMoyenne())}`;

    console.log(boxen(content, { ...boxStyles.stats, borderColor: mission.difficulte <= 3 ? 'green' : mission.difficulte <= 6 ? 'yellow' : 'red' }));
}

// Affiche un item
export function displayItem(item) {
    const rareteColor = getRareteColor(item.rarete);

    let content = '';
    content += `${rareteColor(item.nom)} ${rareteColor(`[${item.rarete}]`)}\n`;
    content += `${colors.textDim(`Type: ${item.type}`)}\n\n`;

    const bonuses = [];
    if (item.bonus.attaque) bonuses.push(`${colors.attaque(`+${item.bonus.attaque} ATK`)}`);
    if (item.bonus.defense) bonuses.push(`${colors.defense(`+${item.bonus.defense} DEF`)}`);
    if (item.bonus.vitesse) bonuses.push(`${colors.vitesse(`+${item.bonus.vitesse} VIT`)}`);
    if (item.bonus.critique) bonuses.push(`${colors.warning(`+${item.bonus.critique}% CRIT`)}`);
    if (item.bonus.esquive) bonuses.push(`${colors.info(`+${item.bonus.esquive}% ESQ`)}`);

    if (bonuses.length > 0) {
        content += bonuses.join('  ');
    }

    console.log(boxen(content, { ...boxStyles.stats, borderColor: item.getRareteColor() }));
}

// Affiche un tableau simple
export function displayTable(headers, rows) {
    // Calcul des largeurs de colonnes
    const widths = headers.map((h, i) => {
        const maxRow = Math.max(...rows.map(r => String(r[i] || '').length));
        return Math.max(h.length, maxRow) + 2;
    });

    // Header
    const headerLine = headers.map((h, i) => colors.textBold(h.padEnd(widths[i]))).join('│');
    const separator = widths.map(w => '─'.repeat(w)).join('┼');

    console.log(colors.textDim('┌' + widths.map(w => '─'.repeat(w)).join('┬') + '┐'));
    console.log('│' + headerLine + '│');
    console.log('├' + separator + '┤');

    // Rows
    rows.forEach(row => {
        const rowLine = row.map((cell, i) => String(cell || '').padEnd(widths[i])).join('│');
        console.log('│' + rowLine + '│');
    });

    console.log(colors.textDim('└' + widths.map(w => '─'.repeat(w)).join('┴') + '┘'));
}

// Affiche un rapport de mission
export function displayMissionReport(report) {
    let statusText, statusColor;

    switch (report.statut) {
        case 'Succès Complet':
            statusText = `${icons.success} SUCCÈS COMPLET`;
            statusColor = colors.success;
            break;
        case 'Succès Partiel':
            statusText = `${icons.warning} SUCCÈS PARTIEL`;
            statusColor = colors.warning;
            break;
        default:
            statusText = `${icons.error} ÉCHEC`;
            statusColor = colors.error;
    }

    let content = '';
    content += `${gradients.title('RAPPORT DE MISSION')}\n\n`;
    content += `Mission: ${colors.textBold(report.nomMission)}\n`;
    content += `Résultat: ${statusColor(statusText)}\n\n`;

    if (report.orGagne > 0) {
        content += `${formatGold(report.orGagne)} gagnés\n`;
    }
    if (report.reputationGagnee !== 0) {
        const repColor = report.reputationGagnee > 0 ? colors.success : colors.error;
        content += `${repColor(`${report.reputationGagnee > 0 ? '+' : ''}${report.reputationGagnee}`)} réputation\n`;
    }

    if (report.aventuriersMorts?.length > 0) {
        content += `\n${colors.error(`${icons.skull} Morts: ${report.aventuriersMorts.join(', ')}`)}`;
    }

    if (report.aventuriersBlesses?.length > 0) {
        content += `\n${colors.warning(`${icons.warning} Blessés: ${report.aventuriersBlesses.join(', ')}`)}`;
    }

    console.log(boxen(content, report.statut === 'Échec' ? boxStyles.error : boxStyles.success));
}

// Écran de victoire
export function displayVictoryScreen(guild, tour) {
    clearScreen();

    const victoryText = figlet.textSync('VICTOIRE!', { font: 'Standard' });
    console.log(gradients.success(victoryText));
    console.log();

    let content = '';
    content += `${icons.crown} Félicitations! Votre guilde ${colors.gold(guild.nom)} est devenue légendaire!\n\n`;
    content += `${colors.textDim('Statistiques finales:')}\n`;
    content += `${icons.star} Niveau moyen: ${colors.niveau(guild.getNiveauMoyen())}\n`;
    content += `${icons.gold} Or final: ${formatGold(guild.or)}\n`;
    content += `${icons.star} Réputation: ${formatReputation(guild.reputation)}\n`;
    content += `Tours joués: ${tour}\n`;
    content += `Aventuriers actifs: ${guild.getAventuriersVivants().length}`;

    console.log(boxen(content, { ...boxStyles.success, borderColor: 'yellow' }));
}

// Écran de défaite
export function displayDefeatScreen(guild, tour, reason) {
    clearScreen();

    const defeatText = figlet.textSync('GAME OVER', { font: 'Standard' });
    console.log(gradients.error(defeatText));
    console.log();

    let content = '';
    content += `${icons.skull} La guilde ${colors.error(guild.nom)} a succombé...\n\n`;
    content += `${colors.textDim('Raison:')} ${reason}\n\n`;
    content += `${colors.textDim('Statistiques finales:')}\n`;
    content += `Tours survécus: ${tour}\n`;
    content += `Or restant: ${formatGold(guild.or)}\n`;
    content += `Réputation finale: ${formatReputation(guild.reputation)}`;

    console.log(boxen(content, boxStyles.error));
}
