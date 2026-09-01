const { successEmbed, errorEmbed } = require('../../utils/embed');
const config = require('../../config/config');
module.exports = {
  name: 'del', aliases: ['deletechannel', 'supprimersalon'],
  description: 'Supprime un salon.', usage: '[#salon]', category: 'Gestion', permLevel: 7, cooldown: 5000, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const channel = message.mentions.channels.first() || message.channel;
    const name    = channel.name;
    await channel.delete(`Supprimé par ${message.author.tag}`);
    if (channel.id !== message.channel.id) {
      await message.reply({ embeds: [successEmbed(`Salon \`${name}\` supprimé.`, `${config.emojis.trash} Salon Supprimé`, guildData)] });
    }
  },
};
