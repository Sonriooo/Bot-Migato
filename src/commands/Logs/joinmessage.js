/**
 * ─────────────────────────────────────────────
 *   Commande — &joinmessage
 *   Configure le message de bienvenue
 * ─────────────────────────────────────────────
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const config = require('../../config/config');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'joinmessage',
  aliases:     ['welcome', 'bienvenue', 'joinmsg'],
  description: 'Configure le message de bienvenue des nouveaux membres.',
  usage:       '',
  category:    'Logs',
  permLevel:   7,
  cooldown:    5000,
  botPerms:    ['ManageChannels'],

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const currentStatus  = guildData?.joinMessage?.enabled ? '✅ Activé' : '❌ Désactivé';
    const currentChannel = guildData?.joinMessage?.channelId
      ? `<#${guildData.joinMessage.channelId}>`
      : 'Non configuré';
    const currentMessage = guildData?.joinMessage?.message || 'Non configuré';

    const embed = createEmbed({
      color,
      title:       `${config.emojis.invite} Configuration Message de Bienvenue`,
      description: 'Configurez le message envoyé lorsqu\'un membre rejoint le serveur.\n\n' +
                   '**Variables disponibles :**\n' +
                   '`{user}` — Mention du membre\n' +
                   '`{username}` — Nom du membre\n' +
                   '`{server}` — Nom du serveur\n' +
                   '`{membercount}` — Nombre de membres',
      fields: [
        { name: 'Statut',   value: currentStatus,  inline: true },
        { name: 'Salon',    value: currentChannel, inline: true },
        { name: 'Message',  value: `\`\`\`${currentMessage}\`\`\``, inline: false },
      ],
      guild: guildData,
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('jm_toggle').setLabel(guildData?.joinMessage?.enabled ? 'Désactiver' : 'Activer').setStyle(guildData?.joinMessage?.enabled ? ButtonStyle.Danger : ButtonStyle.Success).setEmoji('🔄'),
      new ButtonBuilder().setCustomId('jm_channel').setLabel('Changer le Salon').setStyle(ButtonStyle.Primary).setEmoji('📢'),
      new ButtonBuilder().setCustomId('jm_message').setLabel('Modifier le Message').setStyle(ButtonStyle.Secondary).setEmoji('✏️'),
    );

    const reply = await message.reply({ embeds: [embed], components: [buttons] });

    const collector = reply.createMessageComponentCollector({
      time:   60000,
      filter: (i) => i.user.id === message.author.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'jm_toggle') {
        await interaction.deferUpdate();
        const newState = !guildData?.joinMessage?.enabled;
        await updateGuildData(message.guild.id, { 'joinMessage.enabled': newState });
        await reply.edit({
          embeds: [successEmbed(
            `Message de bienvenue **${newState ? 'activé' : 'désactivé'}**.`,
            null, guildData
          )],
          components: [],
        });
        collector.stop();
      }

      if (interaction.customId === 'jm_channel') {
        await interaction.deferUpdate();
        await reply.edit({
          embeds: [createEmbed({ color, title: 'Mentionnez le salon de bienvenue...', guild: guildData })],
          components: [],
        });

        const msgCollector = message.channel.createMessageCollector({
          time:   30000,
          max:    1,
          filter: (m) => m.author.id === message.author.id,
        });

        msgCollector.on('collect', async (m) => {
          const ch = m.mentions.channels.first() || message.guild.channels.cache.get(m.content.trim());
          await m.delete().catch(() => {});
          if (!ch) {
            await reply.edit({ embeds: [errorEmbed('Salon introuvable.', null, guildData)], components: [] });
            return;
          }
          await updateGuildData(message.guild.id, { 'joinMessage.channelId': ch.id });
          await reply.edit({ embeds: [successEmbed(`Salon de bienvenue configuré sur ${ch}.`, null, guildData)], components: [] });
        });
      }

      if (interaction.customId === 'jm_message') {
        const modal = new ModalBuilder()
          .setCustomId('jm_message_modal')
          .setTitle('Message de Bienvenue')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('jm_text')
                .setLabel('Message (utilisez {user}, {server}, etc.)')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(guildData?.joinMessage?.message || 'Bienvenue {user} sur **{server}** ! 🎉')
                .setRequired(true)
            )
          );

        await interaction.showModal(modal);

        const modalResponse = await interaction.awaitModalSubmit({ time: 60000 }).catch(() => null);
        if (!modalResponse) return;

        const text = modalResponse.fields.getTextInputValue('jm_text');
        await updateGuildData(message.guild.id, { 'joinMessage.message': text });
        await modalResponse.reply({ embeds: [successEmbed('Message de bienvenue mis à jour.', null, guildData)], ephemeral: true });
      }
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
