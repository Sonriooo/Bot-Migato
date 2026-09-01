/**
 * ─────────────────────────────────────────────
 *   Événement — interactionCreate
 *   Gestion des boutons, menus et modals
 * ─────────────────────────────────────────────
 */

const { Events, InteractionType } = require('discord.js');
const { errorEmbed } = require('../utils/embed');
const { getGuildData } = require('../utils/guildUtils');

module.exports = {
  name: Events.InteractionCreate,

  async execute(client, interaction) {
    const guildData = interaction.guild
      ? await getGuildData(interaction.guild.id).catch(() => null)
      : null;

    try {
      // ── Boutons ───────────────────────────────
      if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId)
          || client.buttons.find((b) => typeof b.customId === 'function' && b.customId(interaction.customId));

        if (button) {
          await button.execute(client, interaction, guildData);
        }
        return;
      }

      // ── Menus déroulants ──────────────────────
      if (interaction.isStringSelectMenu()) {
        const menu = client.selectMenus.get(interaction.customId)
          || client.selectMenus.find((m) => typeof m.customId === 'function' && m.customId(interaction.customId));

        if (menu) {
          await menu.execute(client, interaction, guildData);
        }
        return;
      }

      // ── Modals ────────────────────────────────
      if (interaction.type === InteractionType.ModalSubmit) {
        const modal = client.modals.get(interaction.customId)
          || client.modals.find((m) => typeof m.customId === 'function' && m.customId(interaction.customId));

        if (modal) {
          await modal.execute(client, interaction, guildData);
        }
        return;
      }

    } catch (error) {
      console.error('[INTERACTION ERROR]', error);

      const errEmbed = errorEmbed(
        `Une erreur est survenue lors du traitement de cette interaction.\n\`\`\`${error.message}\`\`\``,
        null, guildData
      );

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
      }
    }
  },
};
