/**
 * ─────────────────────────────────────────────
 *   Commande — &antispam
 *   Configure la protection anti-spam
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'antispam',
  aliases:     ['anti-spam', 'nospam'],
  description: 'Configure la protection anti-spam (messages répétés).',
  usage:       '<on|off> [seuil] [intervalle_ms] [punition: warn|mute|kick|ban]',
  category:    'Antiraid',
  permLevel:   7,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const action = args[0].toLowerCase();
    if (!['on', 'off'].includes(action)) return message.reply({ embeds: [errorEmbed('Usage : `&antispam <on|off> [seuil] [intervalle] [punition]`', null, guildData)] });

    const enabled    = action === 'on';
    const threshold  = parseInt(args[1]) || 5;
    const interval   = parseInt(args[2]) || 5000;
    const punishment = ['warn', 'mute', 'kick', 'ban'].includes(args[3]) ? args[3] : 'mute';

    await updateGuildData(message.guild.id, {
      'antiraid.antispam':           enabled,
      'antiraid.spamThreshold':      threshold,
      'antiraid.spamInterval':       interval,
      'antiraid.spamPunishment':     punishment,
    });

    await message.reply({
      embeds: [successEmbed(
        `Anti-Spam **${enabled ? 'activé' : 'désactivé'}**.\n` +
        (enabled ? `**Seuil :** ${threshold} messages en ${interval / 1000}s → **${punishment}**` : ''),
        `${config.emojis.raid} Anti-Spam`, guildData
      )],
    });
  },
};
