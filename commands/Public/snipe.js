/**
 * ─────────────────────────────────────────────
 *   Commande — &snipe
 *   Affiche le dernier message supprimé
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { discordTimestamp } = require('../../utils/format');

module.exports = {
  name:        'snipe',
  aliases:     ['s', 'snip'],
  description: 'Affiche le dernier message supprimé dans ce salon.',
  usage:       '',
  category:    'Public',
  permLevel:   0,
  cooldown:    3000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const snipe = client.snipes.get(message.channel.id);

    if (!snipe) {
      return message.reply({
        embeds: [errorEmbed(
          'Aucun message supprimé récemment dans ce salon.',
          null, guildData
        )],
      });
    }

    const embed = createEmbed({
      color,
      author: {
        name:    snipe.author.tag,
        iconURL: snipe.author.displayAvatarURL({ dynamic: true }),
      },
      description: snipe.content || '*[Pas de contenu textuel]*',
      fields: [
        { name: `${config.emojis.time} Supprimé`, value: discordTimestamp(snipe.deletedAt), inline: true },
        { name: `${config.emojis.channel} Salon`, value: `${message.channel}`, inline: true },
      ],
      footer: { text: `Snipe par ${message.author.tag}` },
      guild:  guildData,
    });

    // Ajouter les pièces jointes si présentes
    if (snipe.attachments?.length > 0) {
      embed.setImage(snipe.attachments[0]);
    }

    await message.reply({ embeds: [embed] });
  },
};
