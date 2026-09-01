const { successEmbed, errorEmbed } = require('../../utils/embed');
module.exports = {
  name: 'rename', aliases: ['renommersalon'],
  description: 'Renomme un salon.', usage: '[#salon] <nouveau nom>', category: 'Gestion', permLevel: 5, cooldown: 5000, args: true, minArgs: 1, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const channel = message.mentions.channels.first() || message.channel;
    const name    = (message.mentions.channels.first() ? args.slice(1) : args).join(' ');
    if (!name) return message.reply({ embeds: [errorEmbed('Veuillez spécifier un nom.', null, guildData)] });
    const old = channel.name;
    await channel.setName(name, `Renommé par ${message.author.tag}`);
    await message.reply({ embeds: [successEmbed(`Salon renommé : \`${old}\` → \`${name}\``, null, guildData)] });
  },
};
