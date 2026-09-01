const { successEmbed } = require('../../utils/embed');
module.exports = {
  name: 'unlock-channel', aliases: ['unlockchannel', 'unlockch'],
  description: 'Déverrouille un salon spécifique.', usage: '[#salon]', category: 'Owner', permLevel: 7, cooldown: 5000, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const channel = message.mentions.channels.first() || message.channel;
    await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null }, { reason: `Unlock par ${message.author.tag}` });
    await message.reply({ embeds: [successEmbed(`🔓 Le salon ${channel} a été déverrouillé.`, null, guildData)] });
  },
};
