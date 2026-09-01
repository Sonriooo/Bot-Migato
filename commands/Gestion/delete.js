const { successEmbed, errorEmbed } = require('../../utils/embed');
const config = require('../../config/config');
module.exports = {
  name: 'delete', aliases: ['deleterole', 'supprimerole'],
  description: 'Supprime un rôle du serveur.', usage: '<@rôle>', category: 'Gestion', permLevel: 7, cooldown: 5000, args: true, minArgs: 1, botPerms: ['ManageRoles'],
  async execute(client, message, args, guildData) {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply({ embeds: [errorEmbed('Rôle introuvable.', null, guildData)] });
    if (role.managed) return message.reply({ embeds: [errorEmbed('Impossible de supprimer un rôle géré par un bot.', null, guildData)] });
    const name = role.name;
    await role.delete(`Supprimé par ${message.author.tag}`);
    await message.reply({ embeds: [successEmbed(`Rôle **${name}** supprimé.`, `${config.emojis.trash} Rôle Supprimé`, guildData)] });
  },
};
