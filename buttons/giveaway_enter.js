/**
 * ─────────────────────────────────────────────
 *   Bouton — giveaway_enter
 *   Inscription / désinscription à un giveaway
 * ─────────────────────────────────────────────
 */

const config   = require('../config/config');
const { createEmbed, errorEmbed } = require('../utils/embed');
const { discordTimestamp } = require('../utils/format');
const Giveaway = require('../models/Giveaway');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  customId: 'giveaway_enter',

  async execute(client, interaction, guildData) {
    await interaction.deferReply({ ephemeral: true });

    const giveaway = await Giveaway.findOne({
      messageId: interaction.message.id,
      status:    'active',
    });

    if (!giveaway) {
      return interaction.editReply({
        embeds: [errorEmbed('Ce giveaway est terminé ou introuvable.', null, guildData)],
      });
    }

    const userId  = interaction.user.id;
    const already = giveaway.participants.includes(userId);

    if (already) {
      // Désinscription
      giveaway.participants = giveaway.participants.filter(id => id !== userId);
      await giveaway.save();

      await interaction.editReply({
        embeds: [createEmbed({
          color:       config.colors.warning,
          title:       '🎉 Désinscription',
          description: `Vous avez été **retiré** du giveaway **${giveaway.prize}**.`,
          guild:       guildData,
        })],
      });
    } else {
      // Inscription
      giveaway.participants.push(userId);
      await giveaway.save();

      await interaction.editReply({
        embeds: [createEmbed({
          color:       config.colors.success,
          title:       '🎉 Inscription',
          description: `Vous participez au giveaway **${giveaway.prize}** !\n**Se termine :** ${discordTimestamp(giveaway.endsAt, 'R')}`,
          guild:       guildData,
        })],
      });
    }

    // Mettre à jour l'embed principal
    const color = guildData?.color || config.colors.main;
    const updatedEmbed = createEmbed({
      color,
      title:       `🎉 GIVEAWAY — ${giveaway.prize}`,
      description: `Cliquez sur 🎉 pour participer !\n\n` +
                   `**Organisateur :** <@${giveaway.hostId}>\n` +
                   `**Gagnant(s) :** ${giveaway.winners}\n` +
                   `**Se termine :** ${discordTimestamp(giveaway.endsAt, 'R')} (${discordTimestamp(giveaway.endsAt)})`,
      footer:      { text: `Participants : ${giveaway.participants.length} | ID : ${giveaway.giveawayId}` },
      guild:       guildData,
    });

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel(`Participer (${giveaway.participants.length})`)
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.message.edit({ embeds: [updatedEmbed], components: [button] }).catch(() => {});
  },
};
