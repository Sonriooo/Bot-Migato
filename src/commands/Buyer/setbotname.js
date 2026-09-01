const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isBuyer } = require('../../utils/guildUtils');
module.exports = {
  name: 'setbotname', aliases: ['botname', 'renamebbot'],
  description: 'Change le pseudo du bot. (Réservé aux acheteurs)', usage: '<nouveau nom>', category: 'Buyer', permLevel: 10, cooldown: 60000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const buyer = await isBuyer(message.author.id);
    if (!buyer && message.author.id !== config.botOwner) return message.reply({ embeds: [errorEmbed('Réservé aux acheteurs.', null, guildData)] });
    const name = args.join(' ');
    if (name.length > 32) return message.reply({ embeds: [errorEmbed('Le nom ne peut pas dépasser 32 caractères.', null, guildData)] });
    await client.user.setUsername(name);
    await message.reply({ embeds: [successEmbed(`Le nom du bot a été changé en **${name}**.`, `${config.emojis.settings} Nom Modifié`, guildData)] });
  },
};
