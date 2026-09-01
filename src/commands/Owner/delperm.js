const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'delperm', aliases: ['removeperm', 'rmperm'],
  description: 'Retire un rôle ou utilisateur d\'un niveau de permission.', usage: '<niveau> <@rôle | @utilisateur>', category: 'Owner', permLevel: 9, cooldown: 5000, args: true, minArgs: 2,
  async execute(client, message, args, guildData) {
    const level = parseInt(args[0]);
    if (isNaN(level) || level < 0 || level > 10) return message.reply({ embeds: [errorEmbed('Niveau invalide (0-10).', null, guildData)] });
    const role = message.mentions.roles.first();
    const user = message.mentions.users.first();
    if (!role && !user) return message.reply({ embeds: [errorEmbed('Mentionnez un rôle ou un utilisateur.', null, guildData)] });
    const guild = await Guild.findOne({ guildId: message.guild.id });
    const perms = guild?.permissions || {};
    if (!perms[level]) return message.reply({ embeds: [errorEmbed(`Aucune permission configurée pour le niveau ${level}.`, null, guildData)] });
    if (role) perms[level].roles = (perms[level].roles || []).filter(id => id !== role.id);
    else perms[level].users = (perms[level].users || []).filter(id => id !== user.id);
    await Guild.findOneAndUpdate({ guildId: message.guild.id }, { permissions: perms }, { upsert: true });
    await message.reply({ embeds: [successEmbed(`${role ? `Le rôle ${role}` : `L'utilisateur ${user}`} a été retiré du niveau **${level}**.`, `${config.emojis.shield} Permission Retirée`, guildData)] });
  },
};
