/**
 * ─────────────────────────────────────────────
 *   Commande — &ban
 *   Bannit un membre du serveur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, modlogEmbed } = require('../../utils/embed');
const { createSanction } = require('../../utils/sanctionUtils');
const { sendLog, isBlacklisted } = require('../../utils/guildUtils');

module.exports = {
  name:        'ban',
  aliases:     ['bannir', 'expulser-def'],
  description: 'Bannit définitivement un membre du serveur.',
  usage:       '<@membre> [raison]',
  category:    'Moderation',
  permLevel:   5,
  cooldown:    3000,
  args:        true,
  minArgs:     1,
  botPerms:    ['BanMembers'],

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) {
      return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });
    }

    if (target.id === message.author.id) {
      return message.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous bannir vous-même.', null, guildData)] });
    }

    if (target.id === client.user.id) {
      return message.reply({ embeds: [errorEmbed('Je ne peux pas me bannir moi-même.', null, guildData)] });
    }

    if (await isBlacklisted(target.id)) {
      return message.reply({ embeds: [errorEmbed('Ce membre est blacklisté du bot et ne peut pas être ciblé par les actions du bot.', null, guildData)] });
    }

    if (!target.bannable) {
      return message.reply({ embeds: [errorEmbed('Je ne peux pas bannir ce membre (rôle supérieur).', null, guildData)] });
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';

    // Notifier le membre avant le ban
    await target.user.send({
      embeds: [errorEmbed(
        `Vous avez été **banni** du serveur **${message.guild.name}**.\n**Raison :** ${reason}`,
        `${config.emojis.ban} Bannissement`,
        null
      )],
    }).catch(() => {});

    // Bannir
    await target.ban({ reason: `${message.author.tag} : ${reason}`, deleteMessageSeconds: 86400 });

    // Enregistrer la sanction
    const sanction = await createSanction({
      guildId:     message.guild.id,
      userId:      target.id,
      moderatorId: message.author.id,
      type:        'ban',
      reason,
    });

    // Réponse
    const embed = successEmbed(
      `**${target.user.tag}** a été banni du serveur.\n**Raison :** ${reason}\n**ID Sanction :** \`${sanction.sanctionId}\``,
      `${config.emojis.ban} Bannissement`,
      guildData
    );

    await message.reply({ embeds: [embed] });

    // Log
    const logEmbed = modlogEmbed({
      type:       'ban',
      user:       target.user,
      moderator:  message.author,
      reason,
      sanctionId: sanction.sanctionId,
      guild:      guildData,
    });
    await sendLog(message.guild, 'modlogs', logEmbed, guildData);
  },
};
