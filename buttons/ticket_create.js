/**
 * ─────────────────────────────────────────────
 *   Bouton — ticket_create
 *   Ouvre un nouveau ticket
 * ─────────────────────────────────────────────
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

const config  = require('../config/config');
const { createEmbed, errorEmbed } = require('../utils/embed');
const { getGuildData, updateGuildData } = require('../utils/guildUtils');
const Ticket  = require('../models/Ticket');

module.exports = {
  customId: 'ticket_create',

  async execute(client, interaction, guildData) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guildData) guildData = await getGuildData(guild.id);

    // Vérifier si l'utilisateur a déjà un ticket ouvert
    const existing = await Ticket.findOne({
      guildId: guild.id,
      userId:  interaction.user.id,
      status:  'open',
    });

    if (existing) {
      const ch = guild.channels.cache.get(existing.channelId);
      return interaction.editReply({
        embeds: [errorEmbed(
          `Vous avez déjà un ticket ouvert : ${ch ? ch : `\`#${existing.ticketId}\``}`,
          null, guildData
        )],
      });
    }

    // Incrémenter le compteur
    const counter = (guildData.ticket?.counter || 0) + 1;
    await updateGuildData(guild.id, { 'ticket.counter': counter });

    const ticketId = `ticket-${String(counter).padStart(4, '0')}`;

    // Créer le salon
    const category = guildData.ticket?.categoryId
      ? guild.channels.cache.get(guildData.ticket.categoryId)
      : null;

    const permOverwrites = [
      {
        id:   guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id:    interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      },
      {
        id:    guild.members.me.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
      },
    ];

    // Ajouter les rôles de support
    for (const roleId of (guildData.ticket?.supportRoles || [])) {
      permOverwrites.push({
        id:    roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }

    const ticketChannel = await guild.channels.create({
      name:                ticketId,
      type:                ChannelType.GuildText,
      parent:              category,
      permissionOverwrites: permOverwrites,
      topic:               `Ticket de ${interaction.user.tag} — ${ticketId}`,
    }).catch(() => null);

    if (!ticketChannel) {
      return interaction.editReply({
        embeds: [errorEmbed('Impossible de créer le salon de ticket.', null, guildData)],
      });
    }

    // Enregistrer en base
    await Ticket.create({
      ticketId,
      guildId:   guild.id,
      channelId: ticketChannel.id,
      userId:    interaction.user.id,
    });

    // Message dans le ticket
    const ticketEmbed = createEmbed({
      color:       guildData.color || config.colors.main,
      title:       `${config.emojis.ticket} Ticket ${ticketId}`,
      description: `Bienvenue ${interaction.user} !\n\nDécrivez votre problème et notre équipe vous répondra rapidement.\n\nPour fermer ce ticket, cliquez sur **Fermer**.`,
      fields: [
        { name: `${config.emojis.user} Créé par`, value: `${interaction.user.tag}`, inline: true },
        { name: `${config.emojis.list} ID`,        value: `\`${ticketId}\``, inline: true },
      ],
      guild: guildData,
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Fermer le Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket_claim')
        .setLabel('Prendre en charge')
        .setEmoji('✋')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ticket_transcript')
        .setLabel('Transcript')
        .setEmoji('📄')
        .setStyle(ButtonStyle.Secondary),
    );

    const supportMentions = (guildData.ticket?.supportRoles || []).map(r => `<@&${r}>`).join(' ');

    await ticketChannel.send({
      content:    `${interaction.user}${supportMentions ? ` | ${supportMentions}` : ''}`,
      embeds:     [ticketEmbed],
      components: [buttons],
    });

    await interaction.editReply({
      embeds: [createEmbed({
        color:       config.colors.success,
        title:       `${config.emojis.success} Ticket Créé`,
        description: `Votre ticket a été créé : ${ticketChannel}`,
        guild:       guildData,
      })],
    });
  },
};
