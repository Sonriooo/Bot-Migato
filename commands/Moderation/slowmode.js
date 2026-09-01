/**
 * ─────────────────────────────────────────────
 *   Commande — &slowmode
 *   Définit le slowmode d'un salon
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name:        'slowmode',
  aliases:     ['slow', 'ratelimit'],
  description: 'Définit le slowmode du salon (0 pour désactiver).',
  usage:       '<secondes>',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    3000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageChannels'],

  async execute(client, message, args, guildData) {
    const seconds = parseInt(args[0]);

    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply({ embeds: [errorEmbed('Valeur invalide (0-21600 secondes).', null, guildData)] });
    }

    await message.channel.setRateLimitPerUser(seconds, `Slowmode par ${message.author.tag}`);

    await message.reply({
      embeds: [successEmbed(
        seconds === 0
          ? 'Le slowmode a été **désactivé**.'
          : `Le slowmode a été défini à **${seconds} seconde(s)**.`,
        `${config.emojis.time} Slowmode`, guildData
      )],
    });
  },
};
