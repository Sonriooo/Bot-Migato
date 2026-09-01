/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Pagination Interactive
 * ─────────────────────────────────────────────
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const config = require('../config/config');

/**
 * Crée les boutons de pagination.
 * @param {number} current - Page actuelle (0-indexed)
 * @param {number} total   - Nombre total de pages
 * @param {boolean} disabled
 * @returns {ActionRowBuilder}
 */
function paginationButtons(current, total, disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('page_first')
      .setEmoji(config.emojis.first)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || current === 0),
    new ButtonBuilder()
      .setCustomId('page_prev')
      .setEmoji(config.emojis.prev)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled || current === 0),
    new ButtonBuilder()
      .setCustomId('page_info')
      .setLabel(`${current + 1} / ${total}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('page_next')
      .setEmoji(config.emojis.next)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled || current === total - 1),
    new ButtonBuilder()
      .setCustomId('page_last')
      .setEmoji(config.emojis.last)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || current === total - 1),
  );
}

/**
 * Lance une session de pagination interactive.
 * @param {Message} message - Message de réponse initial
 * @param {EmbedBuilder[]} pages - Tableau d'embeds
 * @param {User} user - Utilisateur autorisé à naviguer
 * @param {number} [timeout=60000] - Délai d'expiration en ms
 */
async function paginate(message, pages, user, timeout = 60000) {
  if (pages.length === 0) return;
  if (pages.length === 1) {
    await message.edit({ embeds: [pages[0]], components: [] });
    return;
  }

  let current = 0;
  const row = paginationButtons(current, pages.length);

  await message.edit({
    embeds: [pages[current]],
    components: [row],
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
    filter: (i) => i.user.id === user.id,
  });

  collector.on('collect', async (interaction) => {
    if (!interaction.isButton()) return;

    switch (interaction.customId) {
      case 'page_first': current = 0; break;
      case 'page_prev':  current = Math.max(0, current - 1); break;
      case 'page_next':  current = Math.min(pages.length - 1, current + 1); break;
      case 'page_last':  current = pages.length - 1; break;
      default: return;
    }

    await interaction.update({
      embeds: [pages[current]],
      components: [paginationButtons(current, pages.length)],
    });
  });

  collector.on('end', async () => {
    await message.edit({
      components: [paginationButtons(current, pages.length, true)],
    }).catch(() => {});
  });
}

/**
 * Divise un tableau en chunks de taille donnée.
 * @param {Array} arr
 * @param {number} size
 * @returns {Array[]}
 */
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

module.exports = { paginationButtons, paginate, chunkArray };
