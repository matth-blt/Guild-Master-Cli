import fs from 'fs';
import path from 'path';
import { Guild } from '../models/guild.js';
import { Mission } from '../models/mission.js';
import { Adventurer } from '../models/adventurer.js';

/**
 * Save/Load system for game persistence
 * @module systems/persistence
 */

const SAVE_DIR = './saves';
const SAVE_FILE = 'savegame.json';

/**
 * Ensures the save directory exists
 * @private
 */
function ensureSaveDir() {
    if (!fs.existsSync(SAVE_DIR)) {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
    }
}

/**
 * Saves the current game state to file
 * @param {Object} gameState - Current game state
 * @param {number} gameState.tour - Current turn
 * @param {number} gameState.niveauVictoire - Victory level target
 * @param {string} gameState.nomGuildeJoueur - Player guild name
 * @param {Guild[]} gameState.guildes - All guilds
 * @param {Mission[]} gameState.missionsGlobales - Available missions
 * @param {Adventurer[]} gameState.candidatsRecrutement - Recruitment candidates
 * @returns {{success: boolean, path?: string, error?: string}} Result
 */
export function saveGame(gameState) {
    try {
        ensureSaveDir();

        const saveData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            tour: gameState.tour,
            niveauVictoire: gameState.niveauVictoire,
            nomGuildeJoueur: gameState.nomGuildeJoueur,
            guildes: gameState.guildes.map(g => g.toJSON()),
            missionsGlobales: gameState.missionsGlobales.map(m => m.toJSON()),
            candidatsRecrutement: gameState.candidatsRecrutement.map(a => a.toJSON())
        };

        const savePath = path.join(SAVE_DIR, SAVE_FILE);
        fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2), 'utf-8');
        return { success: true, path: savePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Loads game state from save file
 * @returns {{success: boolean, gameState?: Object, error?: string}} Result with loaded state
 */
export function loadGame() {
    try {
        const savePath = path.join(SAVE_DIR, SAVE_FILE);

        if (!fs.existsSync(savePath)) {
            return { success: false, error: 'No save file found' };
        }

        const saveContent = fs.readFileSync(savePath, 'utf-8');
        const saveData = JSON.parse(saveContent);

        if (!saveData.version || !saveData.version.startsWith('2.')) {
            return { success: false, error: 'Incompatible save version' };
        }

        const gameState = {
            tour: saveData.tour,
            niveauVictoire: saveData.niveauVictoire,
            nomGuildeJoueur: saveData.nomGuildeJoueur,
            guildes: saveData.guildes.map(g => Guild.fromJSON(g)),
            missionsGlobales: saveData.missionsGlobales.map(m => Mission.fromJSON(m)),
            candidatsRecrutement: saveData.candidatsRecrutement.map(a => Adventurer.fromJSON(a))
        };

        return { success: true, gameState };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Checks if a save file exists
 * @returns {boolean} True if save exists
 */
export function hasSaveGame() {
    const savePath = path.join(SAVE_DIR, SAVE_FILE);
    return fs.existsSync(savePath);
}

/**
 * Deletes the save file
 * @returns {{success: boolean, error?: string}} Result
 */
export function deleteSaveGame() {
    try {
        const savePath = path.join(SAVE_DIR, SAVE_FILE);
        if (fs.existsSync(savePath)) {
            fs.unlinkSync(savePath);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Gets save file info without fully loading it
 * @returns {{tour: number, nomGuildeJoueur: string, timestamp: string, version: string}|null} Save info or null
 */
export function getSaveInfo() {
    try {
        const savePath = path.join(SAVE_DIR, SAVE_FILE);
        if (!fs.existsSync(savePath)) return null;

        const saveContent = fs.readFileSync(savePath, 'utf-8');
        const saveData = JSON.parse(saveContent);

        return {
            tour: saveData.tour,
            nomGuildeJoueur: saveData.nomGuildeJoueur,
            timestamp: saveData.timestamp,
            version: saveData.version
        };
    } catch (error) {
        return null;
    }
}
