/**
 * ─────────────────────────────────────────────
 *   Commande — &setcolor
 *   Change la couleur des embeds du bot
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'setcolor',
  aliases:     ['color', 'couleur', 'embedcolor'],
  description: 'Change la couleur des embeds du bot pour ce serveur.',
  usage:       '<#hexcode | reset>',
  category:    'Owner',
  permLevel:   9,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const input = args[0].toLowerCase();

    if (input === 'reset' || input === 'default') {
      await updateGuildData(message.guild.id, { color: config.colors.main });
      return message.reply({
        embeds: [successEmbed('Couleur réinitialisée à la couleur par défaut.', null, guildData)],
      });
    }

    const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
    if (!hexRegex.test(input)) {
      return message.reply({ embeds: [errorEmbed('Couleur invalide. Exemple : `#5865F2`', null, guildData)] });
    }

    const hex = input.startsWith('#') ? input : `#${input}`;
    await updateGuildData(message.guild.id, { color: hex });

    const preview = createEmbed({
      color:       hex,
      title:       `${config.emojis.settings} Couleur Modifiée`,
      description: `La couleur des embeds a été changée en \`${hex}\`.\nVoici un aperçu de la nouvelle couleur.`,
      guild:       { ...guildData, color: hex },
    });

    await message.reply({ embeds: [preview] });
  },
};
