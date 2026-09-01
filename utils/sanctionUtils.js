/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Gestion des Sanctions
 * ─────────────────────────────────────────────
 */

const Sanction = require('../models/Sanction');
const Guild    = require('../models/Guild');
const { sendLog }        = require('./guildUtils');
const { modlogEmbed }    = require('./embed');
const { formatDuration } = require('./format');

/**
 * Génère un ID de sanction unique pour un serveur.
 * @param {string} guildId
 * @returns {Promise<string>}
 */
async function generateSanctionId(guildId) {
  const count = await Sanction.countDocuments({ guildId });
  return `#${String(count + 1).padStart(4, '0')}`;
}

/**
 * Crée et enregistre une sanction.
 * @param {object} data
 * @returns {Promise<SanctionDoc>}
 */
async function createSanction(data) {
  const sanctionId = await generateSanctionId(data.guildId);
  const sanction   = await Sanction.create({ ...data, sanctionId });
  return sanction;
}

/**
 * Vérifie et lève les sanctions expirées (tempban, tempmute).
 * @param {Client} client
 */
async function checkExpiredSanctions(client) {
  const now       = new Date();
  const expired   = await Sanction.find({
    active:    true,
    expiresAt: { $lte: now },
    type:      { $in: ['tempban', 'tempmute'] },
  });

  for (const sanction of expired) {
    try {
      const guild = client.guilds.cache.get(sanction.guildId);
      if (!guild) continue;

      const guildData = await Guild.findOne({ guildId: sanction.guildId });

      if (sanction.type === 'tempban') {
        // Unban
        await guild.members.unban(sanction.userId, 'Bannissement temporaire expiré').catch(() => {});

        const embed = modlogEmbed({
          type:       'unban',
          user:       { id: sanction.userId, toString: () => `<@${sanction.userId}>` },
          moderator:  client.user,
          reason:     'Bannissement temporaire expiré',
          sanctionId: sanction.sanctionId,
          guild:      guildData,
        });

        await sendLog(guild, 'modlogs', embed, guildData);

      } else if (sanction.type === 'tempmute') {
        // Unmute
        const member = guild.members.cache.get(sanction.userId)
          || await guild.members.fetch(sanction.userId).catch(() => null);

        if (member) {
          // Timeout Discord
          await member.timeout(null, 'Mute temporaire expiré').catch(() => {});

          // Rôle mute si configuré
          if (guildData?.muteRole) {
            await member.roles.remove(guildData.muteRole).catch(() => {});
          }

          const embed = modlogEmbed({
            type:       'unmute',
            user:       member,
            moderator:  client.user,
            reason:     'Mute temporaire expiré',
            sanctionId: sanction.sanctionId,
            guild:      guildData,
          });

          await sendLog(guild, 'modlogs', embed, guildData);
        }
      }

      // Marquer comme inactif
      await Sanction.findByIdAndUpdate(sanction._id, { active: false });

    } catch (error) {
      console.error(`[SANCTIONS] Erreur expiration ${sanction.sanctionId} :`, error.message);
    }
  }
}

module.exports = { generateSanctionId, createSanction, checkExpiredSanctions };
