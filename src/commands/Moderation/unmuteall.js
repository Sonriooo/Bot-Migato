/**
 * ─────────────────────────────────────────────
 *   Commande — &unmuteall
 *   Retire le mute de tous les membres
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, loadingEmbed } = require('../../utils/embed');
const { sendLog } = require('../../utils/guildUtils');
const { createEmbed } = require('../../utils/embed');

module.exports = {
  name:        'unmuteall',
  aliases:     ['demuteall', 'unmute-all'],
  description: 'Retire le mute de tous les membres du serveur.',
  usage:       '',
  category:    'Moderation',
  permLevel:   8,
  cooldown:    10000,
  botPerms:    ['ModerateMembers'],

  async execute(client, message, args, guildData) {
    const reply = await message.reply({
      embeds: [loadingEmbed('Suppression de tous les mutes en cours...', guildData)],
    });

    let count = 0;
    const members = await message.guild.members.fetch();

    for (const [, member] of members) {
      try {
        // Retirer le timeout Discord
        if (member.communicationDisabledUntil) {
          await member.timeout(null, `Unmuteall par ${message.author.tag}`);
          count++;
        }
        // Retirer le rôle mute si configuré
        if (guildData?.muteRole && member.roles.cache.has(guildData.muteRole)) {
          await member.roles.remove(guildData.muteRole);
          count++;
        }
      } catch { /* Ignorer les erreurs individuelles */ }
    }

    await reply.edit({
      embeds: [successEmbed(
        `Tous les mutes ont été levés. **${count}** membre(s) affecté(s).`,
        `${config.emojis.success} Unmuteall`, guildData
      )],
    });
  },
};
