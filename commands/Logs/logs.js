/**
 * ─────────────────────────────────────────────
 *   Commande — &logs
 *   Configure le salon de logs général
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'logs',
  aliases:     ['setlogs', 'log'],
  description: 'Configure le salon de logs général du serveur.',
  usage:       '<#salon | disable>',
  category:    'Logs',
  permLevel:   7,
  cooldown:    3000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageChannels'],

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    if (args[0].toLowerCase() === 'disable' || args[0].toLowerCase() === 'off') {
      await updateGuildData(message.guild.id, { 'logs.general': null });
      return message.reply({
        embeds: [successEmbed('Les logs généraux ont été **désactivés**.', `${config.emojis.log} Logs`, guildData)],
      });
    }

    const channel = message.mentions.channels.first()
      || message.guild.channels.cache.get(args[0]);

    if (!channel || channel.type !== 0) {
      return message.reply({ embeds: [errorEmbed('Salon textuel introuvable.', null, guildData)] });
    }

    await updateGuildData(message.guild.id, { 'logs.general': channel.id });

    await message.reply({
      embeds: [successEmbed(
        `Les logs généraux ont été configurés sur ${channel}.`,
        `${config.emojis.log} Logs Configurés`, guildData
      )],
    });
  },
};
