/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Formatage
 * ─────────────────────────────────────────────
 */

const ms = require('ms');

/**
 * Formate une durée en ms en texte lisible.
 * @param {number} duration - Durée en ms
 * @returns {string}
 */
function formatDuration(duration) {
  if (!duration || duration <= 0) return 'Permanent';

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days > 0)    return `${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0)   return `${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
}

/**
 * Parse une durée depuis une chaîne (ex: "1h", "30m", "2d").
 * @param {string} str
 * @returns {number|null} Durée en ms ou null si invalide
 */
function parseDuration(str) {
  try {
    const result = ms(str);
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Formate une date en timestamp Discord.
 * @param {Date|number} date
 * @param {string} [style] - R, F, D, T, t, d, f
 * @returns {string}
 */
function discordTimestamp(date, style = 'R') {
  const unix = Math.floor((date instanceof Date ? date.getTime() : date) / 1000);
  return `<t:${unix}:${style}>`;
}

/**
 * Tronque un texte à une longueur maximale.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
function truncate(text, max = 1024) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
}

/**
 * Génère un ID de sanction unique.
 * @param {string} guildId
 * @param {number} count
 * @returns {string}
 */
function generateSanctionId(guildId, count) {
  return `${guildId.slice(-4)}-${String(count).padStart(4, '0')}`;
}

/**
 * Capitalise la première lettre.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formate un nombre avec séparateur de milliers.
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  return num?.toLocaleString('fr-FR') || '0';
}

/**
 * Retourne une barre de progression.
 * @param {number} current
 * @param {number} max
 * @param {number} [size=10]
 * @returns {string}
 */
function progressBar(current, max, size = 10) {
  const percentage = Math.min(current / max, 1);
  const filled = Math.round(size * percentage);
  const empty  = size - filled;
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${Math.round(percentage * 100)}%`;
}

module.exports = {
  formatDuration,
  parseDuration,
  discordTimestamp,
  truncate,
  generateSanctionId,
  capitalize,
  formatNumber,
  progressBar,
};
