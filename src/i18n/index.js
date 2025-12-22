import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Internationalization system for multi-language support
 * @module i18n
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentLanguage = 'fr';
let translations = {};

/**
 * Loads translations for a language
 * @param {string} lang - Language code ('fr' or 'en')
 * @returns {boolean} True if loaded successfully
 */
export function loadLanguage(lang) {
    currentLanguage = lang;
    const filePath = path.join(__dirname, `${lang}.json`);

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        translations = JSON.parse(content);
        return true;
    } catch (error) {
        console.error(`Failed to load language file: ${lang}.json`);
        return false;
    }
}

/**
 * Gets a translation by dot-notation key
 * @param {string} key - Translation key (e.g., "menu.title")
 * @param {Object} replacements - Placeholder values (e.g., {name: "John"})
 * @returns {string} Translated string with placeholders replaced
 * @example t('welcome.saveFound', { name: 'MyGuild', turn: 5 })
 */
export function t(key, replacements = {}) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key; // Key not found, return key itself
        }
    }

    // Replace {{variable}} placeholders
    if (typeof value === 'string') {
        return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return replacements[varName] !== undefined ? replacements[varName] : match;
        });
    }

    return value;
}

/** @returns {string} Current language code */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Changes current language
 * @param {string} lang - Language code
 * @returns {boolean} True if changed successfully
 */
export function setLanguage(lang) {
    return loadLanguage(lang);
}

/** Available language options */
export const availableLanguages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' }
];
