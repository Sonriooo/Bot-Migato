const { successEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const config = require('../../config/config');
module.exports = {
  name: 'setticket-message', aliases: ['ticketmessage', 'ticketmsg'],
  description: 'Définit le message du panel de tickets.', usage: '<message>', category: 'Owner', permLevel: 9, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const msg = args.join(' ');
    await updateGuildData(message.guild.id, { 'ticket.message': msg });
    await message.reply({ embeds: [successEmbed(`Message du panel de tickets mis à jour :\n\`\`\`${msg}\`\`\``, `${config.emojis.ticket} Message Tickets`, guildData)] });
  },
};
