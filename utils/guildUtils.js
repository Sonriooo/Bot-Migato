/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Gestion des Guildes
 * ─────────────────────────────────────────────
 */

const Guild = require('../models/Guild');
const Buyer = require('../models/Buyer');

// Cache en mémoire pour éviter des requêtes MongoDB répétées
const guildCache = new Map();
const CACHE_TTL  = 60 * 1000; // 1 minute

/**
 * Récupère ou crée les données d'un serveur.
 * @param {string} guildId
 * @param {boolean} [force=false] - Forcer la mise à jour du cache
 * @returns {Promise<GuildDoc>}
 */
async function getGuildData(guildId, force = false) {
  const cached = guildCache.get(guildId);

  if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let guildData = await Guild.findOne({ guildId });

  if (!guildData) {
    guildData = await Guild.create({ guildId });
  }

  guildCache.set(guildId, { data: guildData, timestamp: Date.now() });
  return guildData;
}

/**
 * Met à jour les données d'un serveur et invalide le cache.
 * @param {string} guildId
 * @param {object} update
 * @returns {Promise<GuildDoc>}
 */
async function updateGuildData(guildId, update) {
  const guildData = await Guild.findOneAndUpdate(
    { guildId },
    update,
    { new: true, upsert: true }
  );
  guildCache.set(guildId, { data: guildData, timestamp: Date.now() });
  return guildData;
}

/**
 * Invalide le cache d'un serveur.
 * @param {string} guildId
 */
function invalidateCache(guildId) {
  guildCache.delete(guildId);
}

/**
 * Envoie un message dans le salon de logs d'un serveur.
 * @param {Guild} guild - Objet Guild Discord
 * @param {string} logType - Type de log (modlogs, msglogs, etc.)
 * @param {EmbedBuilder} embed
 * @param {GuildDoc} [guildData]
 */
async function sendLog(guild, logType, embed, guildData = null) {
  try {
    if (!guildData) guildData = await getGuildData(guild.id);

    const channelId = guildData.logs?.[logType];
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    await channel.send({ embeds: [embed] });
  } catch {
    // Silencieux — le salon peut ne plus exister
  }
}

async function isBuyer(userId) {
  if (!userId) return false;

  const buyer = await Buyer.findOne({ userId });
  return Boolean(buyer && buyer.active);
}

async function isBlacklisted(userId) {
  if (!userId) return false;

  const buyer = await Buyer.findOne({ userId });
  return Boolean(buyer && buyer.banned);
}

module.exports = { getGuildData, updateGuildData, invalidateCache, sendLog, isBuyer, isBlacklisted };
