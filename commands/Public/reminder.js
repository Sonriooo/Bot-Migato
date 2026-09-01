/**
 * ─────────────────────────────────────────────
 *   Commande — &reminder
 *   Crée un rappel temporisé
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { createEmbed, errorEmbed, successEmbed } = require('../../utils/embed');
const { parseDuration, formatDuration, discordTimestamp } = require('../../utils/format');
const Reminder = require('../../models/Reminder');

module.exports = {
  name:        'reminder',
  aliases:     ['remind', 'rappel', 'remindme'],
  description: 'Crée un rappel qui vous sera envoyé après le délai spécifié.',
  usage:       '<durée> <message>',
  category:    'Public',
  permLevel:   0,
  cooldown:    5000,
  args:        true,
  minArgs:     2,

  async execute(client, message, args, guildData) {
    const color    = guildData?.color || config.colors.main;
    const duration = parseDuration(args[0]);

    if (!duration) {
      return message.reply({
        embeds: [errorEmbed(
          'Durée invalide. Exemples : `30s`, `5m`, `1h`, `2d`.',
          null, guildData
        )],
      });
    }

    if (duration < 10000) {
      return message.reply({
        embeds: [errorEmbed('La durée minimale est de 10 secondes.', null, guildData)],
      });
    }

    if (duration > 30 * 24 * 60 * 60 * 1000) {
      return message.reply({
        embeds: [errorEmbed('La durée maximale est de 30 jours.', null, guildData)],
      });
    }

    const reminderMessage = args.slice(1).join(' ');
    const remindAt        = new Date(Date.now() + duration);

    await Reminder.create({
      userId:    message.author.id,
      channelId: message.channel.id,
      guildId:   message.guild.id,
      message:   reminderMessage,
      remindAt,
    });

    const embed = createEmbed({
      color,
      title:       `${config.emojis.reminder} Rappel créé !`,
      description: `Je vous rappellerai dans **${formatDuration(duration)}**.`,
      fields: [
        { name: `${config.emojis.time} Rappel prévu`,  value: discordTimestamp(remindAt), inline: true },
        { name: `${config.emojis.list} Message`,       value: reminderMessage, inline: false },
      ],
      guild: guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
