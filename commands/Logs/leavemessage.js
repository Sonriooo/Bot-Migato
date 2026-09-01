/**
 * ─────────────────────────────────────────────
 *   Commande — &leavemessage
 *   Configure le message de départ
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name:        'leavemessage',
  aliases:     ['goodbye', 'aurevoir', 'leavemsg'],
  description: 'Configure le message envoyé lorsqu\'un membre quitte le serveur.',
  usage:       '',
  category:    'Logs',
  permLevel:   7,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const embed = createEmbed({
      color,
      title:       `👋 Configuration Message de Départ`,
      description: 'Configurez le message envoyé quand un membre quitte.\n\n**Variables :** `{user}`, `{username}`, `{server}`, `{membercount}`',
      fields: [
        { name: 'Statut',  value: guildData?.leaveMessage?.enabled ? '✅ Activé' : '❌ Désactivé', inline: true },
        { name: 'Salon',   value: guildData?.leaveMessage?.channelId ? `<#${guildData.leaveMessage.channelId}>` : 'Non configuré', inline: true },
        { name: 'Message', value: `\`\`\`${guildData?.leaveMessage?.message || 'Non configuré'}\`\`\``, inline: false },
      ],
      guild: guildData,
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('lm_toggle').setLabel(guildData?.leaveMessage?.enabled ? 'Désactiver' : 'Activer').setStyle(guildData?.leaveMessage?.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
      new ButtonBuilder().setCustomId('lm_channel').setLabel('Changer le Salon').setStyle(ButtonStyle.Primary),
    );

    const reply = await message.reply({ embeds: [embed], components: [buttons] });

    const collector = reply.createMessageComponentCollector({ time: 60000, filter: (i) => i.user.id === message.author.id });

    collector.on('collect', async (interaction) => {
      await interaction.deferUpdate();
      if (interaction.customId === 'lm_toggle') {
        const newState = !guildData?.leaveMessage?.enabled;
        await updateGuildData(message.guild.id, { 'leaveMessage.enabled': newState });
        await reply.edit({ embeds: [successEmbed(`Message de départ **${newState ? 'activé' : 'désactivé'}**.`, null, guildData)], components: [] });
        collector.stop();
      }
      if (interaction.customId === 'lm_channel') {
        await reply.edit({ embeds: [createEmbed({ color, title: 'Mentionnez le salon de départ...', guild: guildData })], components: [] });
        const msgCollector = message.channel.createMessageCollector({ time: 30000, max: 1, filter: (m) => m.author.id === message.author.id });
        msgCollector.on('collect', async (m) => {
          const ch = m.mentions.channels.first() || message.guild.channels.cache.get(m.content.trim());
          await m.delete().catch(() => {});
          if (!ch) return reply.edit({ embeds: [errorEmbed('Salon introuvable.', null, guildData)], components: [] });
          await updateGuildData(message.guild.id, { 'leaveMessage.channelId': ch.id });
          await reply.edit({ embeds: [successEmbed(`Salon de départ configuré sur ${ch}.`, null, guildData)], components: [] });
        });
      }
    });

    collector.on('end', () => reply.edit({ components: [] }).catch(() => {}));
  },
};
