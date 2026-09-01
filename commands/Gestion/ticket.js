/**
 * ─────────────────────────────────────────────
 *   Commande — &ticket (Owner)
 *   Configure et déploie le système de tickets
 * ─────────────────────────────────────────────
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

const config = require('../../config/config');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'ticket',
  aliases:     ['tickets', 'setupticket'],
  description: 'Configure et déploie le système de tickets dans un salon.',
  usage:       '<#salon>',
  category:    'Gestion',
  permLevel:   8,
  cooldown:    5000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageChannels', 'ManageRoles'],

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const channel = message.mentions.channels.first()
      || message.guild.channels.cache.get(args[0]);

    if (!channel || channel.type !== 0) {
      return message.reply({ embeds: [errorEmbed('Salon textuel introuvable.', null, guildData)] });
    }

    // Embed du panel de tickets
    const ticketEmbed = createEmbed({
      color,
      title:       `${config.emojis.ticket} Support — Ouvrir un Ticket`,
      description: guildData?.ticket?.message || 'Cliquez sur le bouton ci-dessous pour ouvrir un ticket.\nNotre équipe vous répondra dans les plus brefs délais.',
      thumbnail:   message.guild.iconURL({ dynamic: true }),
      fields: [
        { name: `${config.emojis.time} Temps de réponse`, value: 'Aussi vite que possible', inline: true },
        { name: `${config.emojis.shield} Support`,        value: 'Équipe dédiée', inline: true },
      ],
      guild: guildData,
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('Ouvrir un Ticket')
        .setEmoji('🎫')
        .setStyle(ButtonStyle.Primary),
    );

    await channel.send({ embeds: [ticketEmbed], components: [buttons] });

    // Sauvegarder la configuration
    await updateGuildData(message.guild.id, {
      'ticket.enabled':   true,
      'ticket.channelId': channel.id,
    });

    await message.reply({
      embeds: [successEmbed(
        `Panel de tickets déployé dans ${channel}.`,
        `${config.emojis.ticket} Tickets Configurés`, guildData
      )],
    });
  },
};
