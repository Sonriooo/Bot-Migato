/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Système de Permissions
 * ─────────────────────────────────────────────
 */

const config  = require('../config/config');
const Guild   = require('../models/Guild');
const Buyer   = require('../models/Buyer');
const { isBlacklisted } = require('./guildUtils');

/**
 * Récupère le niveau de permission d'un membre dans un serveur.
 * @param {GuildMember} member
 * @param {GuildDoc} guildData - Document MongoDB du serveur
 * @returns {number} Niveau de 0 à 11
 */
async function getPermLevel(member, guildData = null) {
  if (!member) return 0;

  if (await isBlacklisted(member.id)) return 0;

  const ownerIds = new Set([
    config.ownerId,
    config.botOwner,
    ...(Array.isArray(config.ownerIds) ? config.ownerIds : []),
  ].filter(Boolean));

  // Owner du bot = niveau max
  if (ownerIds.has(member.id)) return 11;

  // Buyer (acheteur du bot) = niveau Owner (11) sur ses serveurs
  const buyer = await Buyer.findOne({ userId: member.id });
  if (buyer && buyer.active) return 11;

  // Propriétaire du serveur = niveau 10 (Sys)
  if (member.guild.ownerId === member.id) return 10;

  // Administrateur Discord = niveau 9
  if (member.permissions.has('Administrator')) return 9;

  if (!guildData) {
    guildData = await Guild.findOne({ guildId: member.guild.id });
  }

  if (!guildData) return 0;

  const perms = guildData.permissions;
  const memberRoles = member.roles.cache.map(r => r.id);

  // Vérification de Perm9 à Perm1 (décroissant)
  const levels = ['Perm9', 'Perm8', 'Perm7', 'Perm6', 'Perm5', 'Perm4', 'Perm3', 'Perm2', 'Perm1'];

  for (const level of levels) {
    const roles = perms[level] || [];
    if (roles.some(roleId => memberRoles.includes(roleId) || roleId === member.id)) {
      return config.permLevels[level];
    }
  }

  return 0;
}

/**
 * Vérifie si un membre a le niveau requis.
 * @param {GuildMember} member
 * @param {number} required - Niveau requis
 * @param {GuildDoc} [guildData]
 * @returns {Promise<boolean>}
 */
async function hasPermLevel(member, required, guildData = null) {
  const level = await getPermLevel(member, guildData);
  return level >= required;
}

/**
 * Retourne le nom du niveau de permission.
 * @param {number} level
 * @returns {string}
 */
function getPermName(level) {
  const names = {
    0:  'Membre',
    1:  'Perm1',
    2:  'Perm2',
    3:  'Perm3',
    4:  'Perm4',
    5:  'Perm5',
    6:  'Perm6',
    7:  'Perm7',
    8:  'Perm8',
    9:  'Perm9',
    10: 'Sys',
    11: 'Owner',
  };
  return names[level] || 'Inconnu';
}

module.exports = { getPermLevel, hasPermLevel, getPermName };
