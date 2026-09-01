/**
 * ─────────────────────────────────────────────
 *   Commande — &tempvoc
 *   Configure les salons vocaux temporaires
 * ─────────────────────────────────────────────
 */

const { ChannelType } = require('discord.js');
const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'tempvoc',
  aliases:     ['tempvoice', 'tv'],
  description: 'Configure le système de salons vocaux temporaires.',
  usage:       '<#salon | disable>',
  category:    'Gestion',
  permLevel:   7,
  cooldown:    5000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageChannels'],

  async execute(client, message, args, guildData) {
    if (args[0].toLowerCase() === 'disable') {
      await updateGuildData(message.guild.id, { 'tempVoc.enabled': false, 'tempVoc.channelId': null });
      return message.reply({ embeds: [successEmbed('Salons vocaux temporaires **désactivés**.', null, guildData)] });
    }

    const channel = message.mentions.channels.first()
      || message.guild.channels.cache.get(args[0]);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      return message.reply({ embeds: [errorEmbed('Salon vocal introuvable.', null, guildData)] });
    }

    await updateGuildData(message.guild.id, {
      'tempVoc.enabled':   true,
      'tempVoc.channelId': channel.id,
    });

    await message.reply({
      embeds: [successEmbed(
        `Salons vocaux temporaires configurés sur **${channel.name}**.\nLes membres qui rejoignent ce salon obtiendront leur propre salon vocal.`,
        `🔊 TempVoc Configuré`, guildData
      )],
    });
  },
};
