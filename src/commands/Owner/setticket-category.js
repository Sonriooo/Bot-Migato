const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const { ChannelType } = require('discord.js');
const config = require('../../config/config');
module.exports = {
  name: 'setticket-category', aliases: ['ticketcategory'],
  description: 'Définit la catégorie où seront créés les tickets.', usage: '<ID catégorie>', category: 'Owner', permLevel: 9, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const category = message.guild.channels.cache.get(args[0]);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply({ embeds: [errorEmbed('Catégorie introuvable.', null, guildData)] });
    await updateGuildData(message.guild.id, { 'ticket.categoryId': category.id });
    await message.reply({ embeds: [successEmbed(`Les tickets seront créés dans la catégorie **${category.name}**.`, `${config.emojis.ticket} Catégorie Tickets`, guildData)] });
  },
};
