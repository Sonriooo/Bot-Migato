/**
 * ─────────────────────────────────────────────
 *   Commande — &antijoin
 *   Configure la protection contre les mass-join
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'antijoin',
  aliases:     ['anti-join', 'massjoin'],
  description: 'Configure la protection anti mass-join.',
  usage:       '<on|off> [seuil] [intervalle_ms] [punition: ban|kick|mute]',
  category:    'Antiraid',
  permLevel:   8,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const action = args[0].toLowerCase();
    if (!['on', 'off'].includes(action)) return message.reply({ embeds: [errorEmbed('Usage : `&antijoin <on|off> [seuil] [intervalle] [punition]`', null, guildData)] });

    const enabled    = action === 'on';
    const threshold  = parseInt(args[1]) || 10;
    const interval   = parseInt(args[2]) || 10000;
    const punishment = ['ban', 'kick', 'mute'].includes(args[3]) ? args[3] : 'ban';

    await updateGuildData(message.guild.id, {
      'antiraid.antijoin':      enabled,
      'antiraid.joinThreshold': threshold,
      'antiraid.joinInterval':  interval,
      'antiraid.punishment':    punishment,
    });

    await message.reply({
      embeds: [successEmbed(
        `Anti-Join **${enabled ? 'activé' : 'désactivé'}**.\n` +
        (enabled ? `**Seuil :** ${threshold} joins en ${interval / 1000}s → **${punishment}**` : ''),
        `${config.emojis.raid} Anti-Join`, guildData
      )],
    });
  },
};
