/**
 * ─────────────────────────────────────────────
 *   Commande — &tempban
 *   Bannissement temporaire
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, modlogEmbed } = require('../../utils/embed');
const { createSanction } = require('../../utils/sanctionUtils');
const { sendLog } = require('../../utils/guildUtils');
const { parseDuration, formatDuration } = require('../../utils/format');

module.exports = {
  name:        'tempban',
  aliases:     ['tban', 'bantemp'],
  description: 'Bannit temporairement un membre du serveur.',
  usage:       '<@membre> <durée> [raison]',
  category:    'Moderation',
  permLevel:   5,
  cooldown:    3000,
  args:        true,
  minArgs:     2,
  botPerms:    ['BanMembers'],

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });
    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous bannir.', null, guildData)] });
    if (!target.bannable) return message.reply({ embeds: [errorEmbed('Je ne peux pas bannir ce membre.', null, guildData)] });

    const durationStr = args[1];
    const duration    = parseDuration(durationStr);

    if (!duration) {
      return message.reply({ embeds: [errorEmbed('Durée invalide. Exemples : `1h`, `2d`, `30m`.', null, guildData)] });
    }

    const reason    = args.slice(2).join(' ') || 'Aucune raison fournie.';
    const expiresAt = new Date(Date.now() + duration);

    // Notifier
    await target.user.send({
      embeds: [errorEmbed(
        `Vous avez été **banni temporairement** du serveur **${message.guild.name}**.\n` +
        `**Durée :** ${formatDuration(duration)}\n**Raison :** ${reason}`,
        `${config.emojis.ban} Bannissement Temporaire`, null
      )],
    }).catch(() => {});

    await target.ban({ reason: `[TEMPBAN ${formatDuration(duration)}] ${message.author.tag} : ${reason}`, deleteMessageSeconds: 86400 });

    const sanction = await createSanction({
      guildId:     message.guild.id,
      userId:      target.id,
      moderatorId: message.author.id,
      type:        'tempban',
      reason,
      duration,
      expiresAt,
    });

    const embed = successEmbed(
      `**${target.user.tag}** a été banni temporairement.\n**Durée :** ${formatDuration(duration)}\n**Raison :** ${reason}\n**ID :** \`${sanction.sanctionId}\``,
      `${config.emojis.ban} Bannissement Temporaire`, guildData
    );
    await message.reply({ embeds: [embed] });

    const logEmbed = modlogEmbed({
      type:       'tempban',
      user:       target.user,
      moderator:  message.author,
      reason,
      duration:   formatDuration(duration),
      sanctionId: sanction.sanctionId,
      guild:      guildData,
    });
    await sendLog(message.guild, 'modlogs', logEmbed, guildData);
  },
};
