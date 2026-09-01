/**
 * ─────────────────────────────────────────────
 *   Commande — &warn
 *   Avertit un membre
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { successEmbed, errorEmbed, modlogEmbed } = require('../../utils/embed');
const { createSanction } = require('../../utils/sanctionUtils');
const { sendLog } = require('../../utils/guildUtils');
const Sanction = require('../../models/Sanction');

module.exports = {
  name:        'warn',
  aliases:     ['avertir', 'avert'],
  description: 'Avertit un membre et enregistre la sanction.',
  usage:       '<@membre> <raison>',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    3000,
  args:        true,
  minArgs:     2,

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });
    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Vous ne pouvez pas vous avertir.', null, guildData)] });
    if (target.user.bot) return message.reply({ embeds: [errorEmbed('Vous ne pouvez pas avertir un bot.', null, guildData)] });

    const reason = args.slice(1).join(' ');

    const sanction = await createSanction({
      guildId:     message.guild.id,
      userId:      target.id,
      moderatorId: message.author.id,
      type:        'warn',
      reason,
    });

    // Compter les warns totaux
    const warnCount = await Sanction.countDocuments({
      guildId: message.guild.id,
      userId:  target.id,
      type:    'warn',
      active:  true,
    });

    // Notifier le membre
    await target.user.send({
      embeds: [errorEmbed(
        `Vous avez reçu un **avertissement** sur le serveur **${message.guild.name}**.\n` +
        `**Raison :** ${reason}\n**Total avertissements :** ${warnCount}`,
        `${config.emojis.warn} Avertissement`, null
      )],
    }).catch(() => {});

    await message.reply({
      embeds: [successEmbed(
        `**${target.user.tag}** a reçu un avertissement.\n**Raison :** ${reason}\n` +
        `**Total warns :** ${warnCount}\n**ID :** \`${sanction.sanctionId}\``,
        `${config.emojis.warn} Avertissement`, guildData
      )],
    });

    await sendLog(message.guild, 'modlogs', modlogEmbed({
      type: 'warn', user: target.user, moderator: message.author,
      reason, sanctionId: sanction.sanctionId, guild: guildData,
    }), guildData);
  },
};
