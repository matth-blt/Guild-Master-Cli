import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Configuration loader for game settings
 * @module core/config
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Default configuration values */
const DEFAULT_CONFIG = {
    difficulty: 'medium',
    nbAdventurer: 30,
    nbAdventurerPerGuild: 10,
    goldStart: 1000,
    victoryLevel: 10
};

/**
 * Loads game configuration from JSON file
 * @returns {Object} Configuration object merged with defaults
 */
export function loadConfig() {
    try {
        const configPath = path.join(__dirname, '../../data/config.json');

        if (!fs.existsSync(configPath)) {
            console.log('Config file not found, using defaults.');
            return DEFAULT_CONFIG;
        }

        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        return { ...DEFAULT_CONFIG, ...config };
    } catch (error) {
        console.error('Error loading config:', error.message);
        return DEFAULT_CONFIG;
    }
}

/**
 * Saves configuration to JSON file
 * @param {Object} config - Configuration to save
 * @returns {boolean} True if saved successfully
 */
export function saveConfig(config) {
    try {
        const configPath = path.join(__dirname, '../../data/config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error saving config:', error.message);
        return false;
    }
}

/**
 * Gets difficulty multiplier for game balance
 * @param {string} difficulty - Difficulty level (low/medium/high/hardcore)
 * @returns {number} Multiplier value
 */
export function getDifficultyModifier(difficulty) {
    switch (difficulty) {
        case 'low': return 0.7;
        case 'medium': return 1.0;
        case 'high': return 1.3;
        case 'hardcore': return 1.6;
        default: return 1.0;
    }
}
