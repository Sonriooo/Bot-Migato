const { successEmbed, errorEmbed } = require('../../utils/embed');
const config = require('../../config/config');
module.exports = {
  name: 'nsfw', aliases: ['age-restrict'],
  description: 'Active/désactive le mode NSFW d\'un salon.', usage: '[#salon]', category: 'Gestion', permLevel: 6, cooldown: 3000, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const channel = message.mentions.channels.first() || message.channel;
    if (channel.type !== 0) return message.reply({ embeds: [errorEmbed('Salon textuel uniquement.', null, guildData)] });
    const newState = !channel.nsfw;
    await channel.setNSFW(newState, `Modifié par ${message.author.tag}`);
    await message.reply({ embeds: [successEmbed(`Le salon ${channel} est maintenant **${newState ? 'NSFW' : 'SFW'}**.`, null, guildData)] });
  },
};
