/**
 * ─────────────────────────────────────────────
 *   Commande — &setprefix
 *   Change le préfixe du bot sur le serveur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'setprefix',
  aliases:     ['prefix', 'changeprefix'],
  description: 'Change le préfixe du bot sur ce serveur.',
  usage:       '<nouveau préfixe>',
  category:    'Owner',
  permLevel:   9,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const newPrefix = args[0];

    if (newPrefix.length > 5) {
      return message.reply({ embeds: [errorEmbed('Le préfixe ne peut pas dépasser 5 caractères.', null, guildData)] });
    }

    await updateGuildData(message.guild.id, { prefix: newPrefix });

    await message.reply({
      embeds: [successEmbed(
        `Le préfixe a été changé en \`${newPrefix}\`.\nUtilisez \`${newPrefix}help\` pour voir les commandes.`,
        `${config.emojis.settings} Préfixe Modifié`, guildData
      )],
    });
  },
};
