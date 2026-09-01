const { ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const config = require('../../config/config');
module.exports = {
  name: 'category', aliases: ['createcategory', 'cat'],
  description: 'Crée une nouvelle catégorie.', usage: '<nom>', category: 'Gestion', permLevel: 7, cooldown: 5000, args: true, minArgs: 1, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const name = args.join(' ');
    const cat  = await message.guild.channels.create({ name, type: ChannelType.GuildCategory, reason: `Créé par ${message.author.tag}` });
    await message.reply({ embeds: [successEmbed(`Catégorie **${cat.name}** créée.`, `${config.emojis.add} Catégorie`, guildData)] });
  },
};
