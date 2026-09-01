const { ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const config = require('../../config/config');
module.exports = {
  name: 'create', aliases: ['createchannel', 'cc'],
  description: 'Crée un nouveau salon (text/voice).', usage: '<text|voice> <nom>', category: 'Gestion', permLevel: 7, cooldown: 5000, args: true, minArgs: 2, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const type = args[0].toLowerCase();
    const name = args.slice(1).join('-');
    const channelType = type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
    const ch = await message.guild.channels.create({ name, type: channelType, reason: `Créé par ${message.author.tag}` });
    await message.reply({ embeds: [successEmbed(`Salon **${ch.name}** créé : ${ch}`, `${config.emojis.add} Salon Créé`, guildData)] });
  },
};
