/**
 * ─────────────────────────────────────────────
 *   Commande — &modlogs
 *   Configure le salon des logs de modération
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'modlogs',
  aliases:     ['setmodlogs', 'modlog'],
  description: 'Configure le salon des logs de modération.',
  usage:       '<#salon | disable>',
  category:    'Logs',
  permLevel:   7,
  cooldown:    3000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    if (args[0].toLowerCase() === 'disable') {
      await updateGuildData(message.guild.id, { 'logs.modlogs': null });
      return message.reply({ embeds: [successEmbed('Logs de modération **désactivés**.', null, guildData)] });
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel || channel.type !== 0) return message.reply({ embeds: [errorEmbed('Salon introuvable.', null, guildData)] });

    await updateGuildData(message.guild.id, { 'logs.modlogs': channel.id });
    await message.reply({ embeds: [successEmbed(`Logs de modération configurés sur ${channel}.`, `${config.emojis.log} Modlogs`, guildData)] });
  },
};
