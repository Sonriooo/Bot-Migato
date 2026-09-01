/**
 * ─────────────────────────────────────────────
 *   Commande — &delrole
 *   Retire un rôle d'un membre
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isBlacklisted } = require('../../utils/guildUtils');

module.exports = {
  name:        'delrole',
  aliases:     ['removerole', 'dr'],
  description: 'Retire un rôle d\'un membre.',
  usage:       '<@membre> <@rôle>',
  category:    'Moderation',
  permLevel:   4,
  cooldown:    3000,
  args:        true,
  minArgs:     2,
  botPerms:    ['ManageRoles'],

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });

    if (await isBlacklisted(target.id)) {
      return message.reply({ embeds: [errorEmbed('Ce membre est blacklisté du bot, l’action est refusée.', null, guildData)] });
    }

    const role = message.mentions.roles.first()
      || message.guild.roles.cache.get(args[1]);

    if (!role) return message.reply({ embeds: [errorEmbed('Rôle introuvable.', null, guildData)] });

    if (!target.roles.cache.has(role.id)) {
      return message.reply({ embeds: [errorEmbed(`**${target.user.tag}** ne possède pas ce rôle.`, null, guildData)] });
    }

    await target.roles.remove(role, `Retiré par ${message.author.tag}`);

    await message.reply({
      embeds: [successEmbed(
        `Le rôle **${role.name}** a été retiré à **${target.user.tag}**.`,
        `${config.emojis.remove} Rôle Retiré`, guildData
      )],
    });
  },
};
