/**
 * ─────────────────────────────────────────────
 *   Événement — guildMemberRemove
 *   Départ d'un membre + message de départ
 * ─────────────────────────────────────────────
 */

const { Events } = require('discord.js');
const config     = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');
const { discordTimestamp, formatNumber } = require('../utils/format');

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(client, member) {
    const guildData = await getGuildData(member.guild.id).catch(() => null);

    // ── Log de départ ─────────────────────────
    const leaveEmbed = createEmbed({
      color:       config.colors.error,
      title:       `👋 Membre Parti`,
      description: `**${member.user.tag}** a quitté le serveur.`,
      fields: [
        { name: `${config.emojis.user} Membre`,      value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
        { name: `${config.emojis.time} A rejoint le`,value: member.joinedAt ? discordTimestamp(member.joinedAt) : 'Inconnu', inline: true },
        { name: `${config.emojis.user} Membres`,     value: formatNumber(member.guild.memberCount), inline: true },
      ],
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      guild:     guildData,
    });

    await sendLog(member.guild, 'leavelogs', leaveEmbed, guildData);

    // ── Message de départ ─────────────────────
    if (guildData?.leaveMessage?.enabled && guildData?.leaveMessage?.channelId) {
      const channel = member.guild.channels.cache.get(guildData.leaveMessage.channelId);
      if (!channel) return;

      const text = (guildData.leaveMessage.message || '{user} a quitté **{server}**. 👋')
        .replace(/{user}/g, member.user.tag)
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, formatNumber(member.guild.memberCount));

      if (guildData.leaveMessage.embed) {
        const leaveMsg = createEmbed({
          color:       guildData.color || config.colors.main,
          description: text,
          thumbnail:   member.user.displayAvatarURL({ dynamic: true }),
          guild:       guildData,
        });
        await channel.send({ embeds: [leaveMsg] }).catch(() => {});
      } else {
        await channel.send(text).catch(() => {});
      }
    }
  },
};
