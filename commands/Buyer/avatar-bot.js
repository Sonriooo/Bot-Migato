/**
 * ─────────────────────────────────────────────
 *   Commande — &avatar-bot
 *   Change l'avatar du bot (Buyer)
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isBuyer } = require('../../utils/guildUtils');

module.exports = {
  name:        'avatar-bot',
  aliases:     ['setavatar', 'botavatar', 'changeavatar'],
  description: 'Change l\'avatar du bot. (Réservé aux acheteurs)',
  usage:       '<URL de l\'image | attachment>',
  category:    'Buyer',
  permLevel:   10,
  cooldown:    60000,

  async execute(client, message, args, guildData) {
    const buyer = await isBuyer(message.author.id);
    if (!buyer && message.author.id !== config.botOwner) {
      return message.reply({ embeds: [errorEmbed('Cette commande est réservée aux acheteurs du bot.', null, guildData)] });
    }

    const url = args[0] || message.attachments.first()?.url;

    if (!url) {
      return message.reply({ embeds: [errorEmbed('Veuillez fournir une URL d\'image ou joindre une image.', null, guildData)] });
    }

    // Valider l'URL
    try {
      new URL(url);
    } catch {
      return message.reply({ embeds: [errorEmbed('URL invalide.', null, guildData)] });
    }

    await client.user.setAvatar(url);

    await message.reply({
      embeds: [successEmbed(
        `L'avatar du bot a été mis à jour avec succès.`,
        `${config.emojis.settings} Avatar Modifié`, guildData
      )],
    });
  },
};
