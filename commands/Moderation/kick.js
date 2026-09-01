/**
 * ─────────────────────────────────────────────
 *   Commande — &kick
 *   Expulse un membre du serveur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, modlogEmbed } = require('../../utils/embed');
const { createSanction } = require('../../utils/sanctionUtils');
const { sendLog, isBlacklisted } = require('../../utils/guildUtils');

module.exports = {
  name:        'kick',
  aliases:     ['expulser', 'kk'],
  description: 'Expulse un membre du serveur.',
  usage:       '<@membre> [raison]',
  category:    'Moderation',
  permLevel:   4,
  cooldown:    3000,
  args:        true,
  minArgs:     1,
  botPerms:    ['KickMembers'],

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });
    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous expulser.', null, guildData)] });
    if (await isBlacklisted(target.id)) {
      return message.reply({ embeds: [errorEmbed('Ce membre est blacklisté du bot, l’action est refusée.', null, guildData)] });
    }
    if (!target.kickable) return message.reply({ embeds: [errorEmbed('Je ne peux pas expulser ce membre.', null, guildData)] });

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';

    await target.user.send({
      embeds: [errorEmbed(
        `Vous avez été **expulsé** du serveur **${message.guild.name}**.\n**Raison :** ${reason}`,
        `${config.emojis.kick} Expulsion`, null
      )],
    }).catch(() => {});

    await target.kick(`${message.author.tag} : ${reason}`);

    const sanction = await createSanction({
      guildId:     message.guild.id,
      userId:      target.id,
      moderatorId: message.author.id,
      type:        'kick',
      reason,
    });

    await message.reply({
      embeds: [successEmbed(
        `**${target.user.tag}** a été expulsé.\n**Raison :** ${reason}\n**ID :** \`${sanction.sanctionId}\``,
        `${config.emojis.kick} Expulsion`, guildData
      )],
    });

    await sendLog(message.guild, 'modlogs', modlogEmbed({
      type: 'kick', user: target.user, moderator: message.author,
      reason, sanctionId: sanction.sanctionId, guild: guildData,
    }), guildData);
  },
};
