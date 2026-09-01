/**
 * ─────────────────────────────────────────────
 *   Commande — &setmute
 *   Configure le rôle de mute du serveur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, loadingEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'setmute',
  aliases:     ['muterole', 'set-mute'],
  description: 'Configure le rôle de mute et applique les permissions dans tous les salons.',
  usage:       '<@rôle>',
  category:    'Moderation',
  permLevel:   7,
  cooldown:    10000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageRoles', 'ManageChannels'],

  async execute(client, message, args, guildData) {
    const role = message.mentions.roles.first()
      || message.guild.roles.cache.get(args[0]);

    if (!role) return message.reply({ embeds: [errorEmbed('Rôle introuvable.', null, guildData)] });

    const reply = await message.reply({
      embeds: [loadingEmbed(`Configuration du rôle mute **${role.name}** en cours...`, guildData)],
    });

    // Appliquer les permissions dans tous les salons textuels
    let count = 0;
    for (const [, channel] of message.guild.channels.cache) {
      if (channel.type === 0 || channel.type === 5) { // Texte ou Annonce
        await channel.permissionOverwrites.edit(role, {
          SendMessages:       false,
          AddReactions:       false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false,
        }).catch(() => {});
        count++;
      }
    }

    // Sauvegarder en base
    await updateGuildData(message.guild.id, { muteRole: role.id });

    await reply.edit({
      embeds: [successEmbed(
        `Le rôle mute a été configuré sur **${role.name}**.\n` +
        `Permissions appliquées dans **${count}** salon(s).`,
        `${config.emojis.mute} Rôle Mute Configuré`, guildData
      )],
    });
  },
};
