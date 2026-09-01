const { successEmbed, errorEmbed } = require('../../utils/embed');
module.exports = {
  name: 'lock-channel', aliases: ['lockchannel', 'lockch'],
  description: 'Verrouille un salon spécifique.', usage: '[#salon] [raison]', category: 'Owner', permLevel: 7, cooldown: 5000, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const channel = message.mentions.channels.first() || message.channel;
    const reason  = (message.mentions.channels.first() ? args.slice(1) : args).join(' ') || 'Salon verrouillé';
    await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false }, { reason: `${message.author.tag} : ${reason}` });
    await message.reply({ embeds: [successEmbed(`🔒 Le salon ${channel} a été verrouillé.\n**Raison :** ${reason}`, null, guildData)] });
  },
};
