const { successEmbed, errorEmbed } = require('../../utils/embed');
const config = require('../../config/config');
module.exports = {
  name: 'add', aliases: ['createrole'],
  description: 'Crée un nouveau rôle sur le serveur.', usage: '<nom> [couleur hex]', category: 'Gestion', permLevel: 6, cooldown: 5000, args: true, minArgs: 1, botPerms: ['ManageRoles'],
  async execute(client, message, args, guildData) {
    const color = args[args.length - 1]?.startsWith('#') ? args.pop() : null;
    const name  = args.join(' ');
    const role  = await message.guild.roles.create({ name, color: color || null, reason: `Créé par ${message.author.tag}` });
    await message.reply({ embeds: [successEmbed(`Rôle **${role.name}** créé avec succès.`, `${config.emojis.add} Rôle Créé`, guildData)] });
  },
};
