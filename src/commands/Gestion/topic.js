const { successEmbed, errorEmbed } = require('../../utils/embed');
module.exports = {
  name: 'topic', aliases: ['settopic', 'sujet'],
  description: 'Définit le sujet d\'un salon textuel.', usage: '<sujet>', category: 'Gestion', permLevel: 4, cooldown: 5000, args: true, minArgs: 1, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    if (message.channel.type !== 0) return message.reply({ embeds: [errorEmbed('Salon textuel uniquement.', null, guildData)] });
    const topic = args.join(' ');
    await message.channel.setTopic(topic, `Modifié par ${message.author.tag}`);
    await message.reply({ embeds: [successEmbed(`Sujet du salon mis à jour : \`${topic}\``, null, guildData)] });
  },
};
