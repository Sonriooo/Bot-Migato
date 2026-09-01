/**
 * ─────────────────────────────────────────────
 *   Commande — &unmute
 *   Retire le mute d'un membre
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { successEmbed, errorEmbed, modlogEmbed } = require('../../utils/embed');
const { createSanction } = require('../../utils/sanctionUtils');
const { sendLog } = require('../../utils/guildUtils');
const Sanction = require('../../models/Sanction');

module.exports = {
  name:        'unmute',
  aliases:     ['demute', 'untimeout'],
  description: 'Retire le mute d\'un membre.',
  usage:       '<@membre> [raison]',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    3000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ModerateMembers'],

  async execute(client, message, args, guildData) {
    const target = message.mentions.members.first()
      || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';

    // Retirer le timeout Discord
    await target.timeout(null, `${message.author.tag} : ${reason}`).catch(() => {});

    // Retirer le rôle mute si configuré
    if (guildData?.muteRole) {
      await target.roles.remove(guildData.muteRole).catch(() => {});
    }

    // Désactiver les sanctions de mute actives
    await Sanction.updateMany(
      { guildId: message.guild.id, userId: target.id, type: { $in: ['mute', 'tempmute'] }, active: true },
      { active: false }
    );

    const sanction = await createSanction({
      guildId:     message.guild.id,
      userId:      target.id,
      moderatorId: message.author.id,
      type:        'unmute',
      reason,
    });

    await message.reply({
      embeds: [successEmbed(
        `**${target.user.tag}** a été unmuté.\n**Raison :** ${reason}`,
        `${config.emojis.success} Unmute`, guildData
      )],
    });

    await sendLog(message.guild, 'modlogs', modlogEmbed({
      type: 'unmute', user: target.user, moderator: message.author,
      reason, sanctionId: sanction.sanctionId, guild: guildData,
    }), guildData);
  },
};
