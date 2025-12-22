import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ===== CONFIG LOADER =====

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG = {
    difficulty: 'medium',
    nbAdventurer: 30,
    nbAdventurerPerGuild: 10,
    goldStart: 1000,
    victoryLevel: 10
};

// Charge la configuration depuis le fichier JSON
export function loadConfig() {
    try {
        const configPath = path.join(__dirname, '../../data/config.json');

        if (!fs.existsSync(configPath)) {
            console.log('Fichier de configuration non trouvé, utilisation des valeurs par défaut.');
            return DEFAULT_CONFIG;
        }

        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);

        // Merge avec les valeurs par défaut
        return { ...DEFAULT_CONFIG, ...config };
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error.message);
        return DEFAULT_CONFIG;
    }
}

// Sauvegarde la configuration
export function saveConfig(config) {
    try {
        const configPath = path.join(__dirname, '../../data/config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error.message);
        return false;
    }
}

// Obtient le modificateur de difficulté
export function getDifficultyModifier(difficulty) {
    switch (difficulty) {
        case 'low': return 0.7;
        case 'medium': return 1.0;
        case 'high': return 1.3;
        case 'hardcore': return 1.6;
        default: return 1.0;
    }
}
