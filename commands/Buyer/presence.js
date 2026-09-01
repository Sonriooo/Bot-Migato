/**
 * ─────────────────────────────────────────────
 *   Commande — &presence
 *   Change le statut/présence du bot (Buyer)
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isBuyer } = require('../../utils/guildUtils');

const ACTIVITY_TYPES = {
  playing:   0,
  streaming: 1,
  listening: 2,
  watching:  3,
  competing: 5,
};

const STATUS_TYPES = ['online', 'idle', 'dnd', 'invisible'];

module.exports = {
  name:        'presence',
  aliases:     ['setpresence', 'setstatus', 'activity'],
  description: 'Change la présence/activité du bot. (Réservé aux acheteurs)',
  usage:       '<playing|watching|listening|competing> <texte> | <status: online|idle|dnd|invisible>',
  category:    'Buyer',
  permLevel:   10,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    // Vérifier si l'utilisateur est un acheteur ou le dev
    const buyer = await isBuyer(message.author.id);
    if (!buyer && message.author.id !== config.botOwner) {
      return message.reply({ embeds: [errorEmbed('Cette commande est réservée aux acheteurs du bot.', null, guildData)] });
    }

    const type = args[0].toLowerCase();

    // Changer le statut Discord
    if (STATUS_TYPES.includes(type)) {
      client.user.setStatus(type);
      return message.reply({
        embeds: [successEmbed(`Statut changé en **${type}**.`, `${config.emojis.settings} Présence`, guildData)],
      });
    }

    // Changer l'activité
    if (!ACTIVITY_TYPES.hasOwnProperty(type)) {
      return message.reply({
        embeds: [errorEmbed(
          `Type invalide. Options : \`playing\`, \`watching\`, \`listening\`, \`competing\`, \`online\`, \`idle\`, \`dnd\`, \`invisible\``,
          null, guildData
        )],
      });
    }

    const text = args.slice(1).join(' ');
    if (!text) return message.reply({ embeds: [errorEmbed('Veuillez spécifier le texte de l\'activité.', null, guildData)] });

    client.user.setActivity(text, { type: ACTIVITY_TYPES[type] });

    await message.reply({
      embeds: [successEmbed(
        `Activité changée : **${type.charAt(0).toUpperCase() + type.slice(1)} ${text}**`,
        `${config.emojis.settings} Présence`, guildData
      )],
    });
  },
};
