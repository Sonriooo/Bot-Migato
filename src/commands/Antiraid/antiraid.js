/**
 * ─────────────────────────────────────────────
 *   Commande — &antiraid
 *   Active/désactive et configure l'antiraid
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'antiraid',
  aliases:     ['ar', 'anti-raid'],
  description: 'Active/désactive le système antiraid.',
  usage:       '<on|off>',
  category:    'Antiraid',
  permLevel:   8,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const color  = guildData?.color || config.colors.main;
    const action = args[0].toLowerCase();

    if (!['on', 'off', 'enable', 'disable'].includes(action)) {
      return message.reply({ embeds: [errorEmbed('Usage : `&antiraid <on|off>`', null, guildData)] });
    }

    const enabled = action === 'on' || action === 'enable';
    await updateGuildData(message.guild.id, { 'antiraid.enabled': enabled });

    const status = guildData?.antiraid || {};

    const embed = createEmbed({
      color,
      title:       `${config.emojis.raid} Antiraid — ${enabled ? 'Activé ✅' : 'Désactivé ❌'}`,
      description: `Le système antiraid a été **${enabled ? 'activé' : 'désactivé'}**.`,
      fields: [
        { name: '🚪 Anti-Join',      value: status.antijoin     ? '✅' : '❌', inline: true },
        { name: '🤖 Anti-Bot',       value: status.antibot      ? '✅' : '❌', inline: true },
        { name: '💬 Anti-Spam',      value: status.antispam     ? '✅' : '❌', inline: true },
        { name: '🔗 Anti-Liens',     value: status.antilinks    ? '✅' : '❌', inline: true },
        { name: '📨 Anti-Invites',   value: status.antiinvite   ? '✅' : '❌', inline: true },
        { name: '📣 Anti-Mentions',  value: status.antimentions ? '✅' : '❌', inline: true },
      ],
      footer: { text: 'Utilisez &antiraid-status pour voir la configuration complète.' },
      guild:  guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
