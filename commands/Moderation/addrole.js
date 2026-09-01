/**
 * ─────────────────────────────────────────────
 *   Commande — &addrole
 *   Ajoute un rôle à un membre
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { isBlacklisted } = require('../../utils/guildUtils');

module.exports = {
  name:        'addrole',
  aliases:     ['giverole', 'ar'],
  description: 'Ajoute un rôle à un membre.',
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
      return message.reply({ embeds: [errorEmbed('Ce membre est blacklisté du bot et ne peut pas recevoir de rôle via le bot.', null, guildData)] });
    }

    const role = message.mentions.roles.first()
      || message.guild.roles.cache.get(args[1]);

    if (!role) return message.reply({ embeds: [errorEmbed('Rôle introuvable.', null, guildData)] });

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({ embeds: [errorEmbed('Ce rôle est supérieur ou égal à mon rôle le plus haut.', null, guildData)] });
    }

    if (target.roles.cache.has(role.id)) {
      return message.reply({ embeds: [errorEmbed(`**${target.user.tag}** possède déjà ce rôle.`, null, guildData)] });
    }

    await target.roles.add(role, `Ajouté par ${message.author.tag}`);

    await message.reply({
      embeds: [successEmbed(
        `Le rôle **${role.name}** a été ajouté à **${target.user.tag}**.`,
        `${config.emojis.add} Rôle Ajouté`, guildData
      )],
    });
  },
};
