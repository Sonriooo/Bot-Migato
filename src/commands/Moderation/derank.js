/**
 * ─────────────────────────────────────────────
 *   Commande — &derank
 *   Retire tous les rôles d'un membre
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, modlogEmbed } = require('../../utils/embed');
const { createSanction } = require('../../utils/sanctionUtils');
const { sendLog } = require('../../utils/guildUtils');

module.exports = {
  name:        'derank',
  aliases:     ['removeroles', 'stripperoles'],
  description: 'Retire tous les rôles d\'un membre.',
  usage:       '<@membre> [raison]',
  category:    'Moderation',
  permLevel:   6,
  cooldown:    3000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageRoles'],

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });
    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous derank.', null, guildData)] });

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';

    // Sauvegarder les rôles avant suppression
    const roles = target.roles.cache
      .filter(r => r.id !== message.guild.id && r.managed === false)
      .map(r => r.id);

    // Retirer les rôles
    await target.roles.set([message.guild.id], `${message.author.tag} : ${reason}`);

    const sanction = await createSanction({
      guildId:     message.guild.id,
      userId:      target.id,
      moderatorId: message.author.id,
      type:        'derank',
      reason,
      extra:       { roles },
    });

    await message.reply({
      embeds: [successEmbed(
        `**${target.user.tag}** a été deranké (**${roles.length}** rôle(s) retirés).\n**Raison :** ${reason}\n**ID :** \`${sanction.sanctionId}\``,
        `${config.emojis.remove} Derank`, guildData
      )],
    });

    await sendLog(message.guild, 'modlogs', modlogEmbed({
      type: 'derank', user: target.user, moderator: message.author,
      reason, sanctionId: sanction.sanctionId, guild: guildData,
    }), guildData);
  },
};
