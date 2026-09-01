/**
 * ─────────────────────────────────────────────
 *   Commande — &addperm
 *   Ajoute un rôle/utilisateur à un niveau de permission
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData, getGuildData } = require('../../utils/guildUtils');
const Guild = require('../../models/Guild');

module.exports = {
  name:        'addperm',
  aliases:     ['addpermission', 'setperm'],
  description: 'Ajoute un rôle ou utilisateur à un niveau de permission.',
  usage:       '<niveau 0-10> <@rôle | @utilisateur>',
  category:    'Owner',
  permLevel:   9,
  cooldown:    5000,
  args:        true,
  minArgs:     2,

  async execute(client, message, args, guildData) {
    const level = parseInt(args[0]);

    if (isNaN(level) || level < 0 || level > 10) {
      return message.reply({ embeds: [errorEmbed('Niveau invalide (0-10).', null, guildData)] });
    }

    const role   = message.mentions.roles.first();
    const user   = message.mentions.users.first();
    const target = role || user;

    if (!target) {
      return message.reply({ embeds: [errorEmbed('Mentionnez un rôle ou un utilisateur.', null, guildData)] });
    }

    // Récupérer les permissions actuelles
    const guild = await Guild.findOne({ guildId: message.guild.id });
    const perms = guild?.permissions || {};

    if (!perms[level]) perms[level] = { roles: [], users: [] };

    if (role) {
      if (!perms[level].roles.includes(role.id)) perms[level].roles.push(role.id);
    } else {
      if (!perms[level].users.includes(user.id)) perms[level].users.push(user.id);
    }

    await Guild.findOneAndUpdate(
      { guildId: message.guild.id },
      { permissions: perms },
      { upsert: true }
    );

    await message.reply({
      embeds: [successEmbed(
        `${role ? `Le rôle ${role}` : `L'utilisateur ${user}`} a été ajouté au niveau **${level}**.`,
        `${config.emojis.shield} Permission Ajoutée`, guildData
      )],
    });
  },
};
