/**
 * ─────────────────────────────────────────────
 *   Commande — &tempmute
 *   Mute temporaire d'un membre
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, modlogEmbed } = require('../../utils/embed');
const { createSanction } = require('../../utils/sanctionUtils');
const { sendLog } = require('../../utils/guildUtils');
const { parseDuration, formatDuration } = require('../../utils/format');

module.exports = {
  name:        'tempmute',
  aliases:     ['tmute', 'mutetemp', 'timeout'],
  description: 'Mute temporairement un membre (timeout Discord).',
  usage:       '<@membre> <durée> [raison]',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    3000,
  args:        true,
  minArgs:     2,
  botPerms:    ['ModerateMembers'],

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });
    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous muter.', null, guildData)] });
    if (!target.moderatable) return message.reply({ embeds: [errorEmbed('Je ne peux pas muter ce membre.', null, guildData)] });

    const durationStr = args[1];
    const duration    = parseDuration(durationStr);

    if (!duration) return message.reply({ embeds: [errorEmbed('Durée invalide. Exemples : `10m`, `1h`, `2d`.', null, guildData)] });

    // Limite Discord : 28 jours max pour le timeout
    const maxTimeout = 28 * 24 * 60 * 60 * 1000;
    if (duration > maxTimeout) {
      return message.reply({ embeds: [errorEmbed('La durée maximale du timeout Discord est de 28 jours.', null, guildData)] });
    }

    const reason    = args.slice(2).join(' ') || 'Aucune raison fournie.';
    const expiresAt = new Date(Date.now() + duration);

    // Appliquer le timeout Discord
    await target.timeout(duration, `${message.author.tag} : ${reason}`);

    // Rôle mute si configuré
    if (guildData?.muteRole) {
      await target.roles.add(guildData.muteRole).catch(() => {});
    }

    const sanction = await createSanction({
      guildId:     message.guild.id,
      userId:      target.id,
      moderatorId: message.author.id,
      type:        'tempmute',
      reason,
      duration,
      expiresAt,
    });

    await target.user.send({
      embeds: [errorEmbed(
        `Vous avez été **muté** sur le serveur **${message.guild.name}**.\n` +
        `**Durée :** ${formatDuration(duration)}\n**Raison :** ${reason}`,
        `${config.emojis.mute} Mute Temporaire`, null
      )],
    }).catch(() => {});

    await message.reply({
      embeds: [successEmbed(
        `**${target.user.tag}** a été muté pour **${formatDuration(duration)}**.\n**Raison :** ${reason}\n**ID :** \`${sanction.sanctionId}\``,
        `${config.emojis.mute} Mute Temporaire`, guildData
      )],
    });

    await sendLog(message.guild, 'modlogs', modlogEmbed({
      type: 'tempmute', user: target.user, moderator: message.author,
      reason, duration: formatDuration(duration), sanctionId: sanction.sanctionId, guild: guildData,
    }), guildData);
  },
};
