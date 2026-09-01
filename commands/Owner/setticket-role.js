const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const config = require('../../config/config');
module.exports = {
  name: 'setticket-role', aliases: ['ticketrole', 'supportrole'],
  description: 'Définit le(s) rôle(s) de support pour les tickets.', usage: '<@rôle>', category: 'Owner', permLevel: 9, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply({ embeds: [errorEmbed('Rôle introuvable.', null, guildData)] });
    const roles = [...(guildData?.ticket?.supportRoles || [])];
    if (!roles.includes(role.id)) roles.push(role.id);
    await updateGuildData(message.guild.id, { 'ticket.supportRoles': roles });
    await message.reply({ embeds: [successEmbed(`Le rôle **${role.name}** a été ajouté aux rôles de support des tickets.`, `${config.emojis.ticket} Rôle Support`, guildData)] });
  },
};
