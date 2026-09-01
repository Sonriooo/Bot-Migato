/**
 * ─────────────────────────────────────────────
 *   Commande — &close
 *   Ferme le ticket du salon actuel
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { sendLog } = require('../../utils/guildUtils');
const { createEmbed } = require('../../utils/embed');
const Ticket = require('../../models/Ticket');

module.exports = {
  name:        'close',
  aliases:     ['fermer', 'closeticket'],
  description: 'Ferme le ticket du salon actuel.',
  usage:       '',
  category:    'Gestion',
  permLevel:   3,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const ticket = await Ticket.findOne({
      channelId: message.channel.id,
      status:    'open',
    });

    if (!ticket) {
      return message.reply({ embeds: [errorEmbed('Ce salon n\'est pas un ticket ouvert.', null, guildData)] });
    }

    await Ticket.findByIdAndUpdate(ticket._id, {
      status:   'closed',
      closedBy: message.author.id,
      closedAt: new Date(),
    });

    const logEmbed = createEmbed({
      color:       config.colors.warning,
      title:       `${config.emojis.ticket} Ticket Fermé`,
      description: `Ticket \`${ticket.ticketId}\` fermé par ${message.author}.`,
      fields: [
        { name: 'Créé par',  value: `<@${ticket.userId}>`, inline: true },
        { name: 'Fermé par', value: `${message.author}`, inline: true },
      ],
      guild: guildData,
    });

    await sendLog(message.guild, 'modlogs', logEmbed, guildData);

    await message.reply({
      embeds: [successEmbed('Ticket fermé. Suppression dans 5 secondes.', null, guildData)],
    });

    setTimeout(async () => {
      await message.channel.delete('Ticket fermé').catch(() => {});
      await Ticket.findByIdAndUpdate(ticket._id, { status: 'deleted' });
    }, 5000);
  },
};
