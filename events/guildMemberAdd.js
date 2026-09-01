/**
 * ─────────────────────────────────────────────
 *   Événement — guildMemberAdd
 *   Arrivée d'un membre + antiraid + message
 * ─────────────────────────────────────────────
 */

const { Events } = require('discord.js');
const config     = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');
const { discordTimestamp, formatNumber } = require('../utils/format');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(client, member) {
    const guildData = await getGuildData(member.guild.id).catch(() => null);

    // ── Antiraid — détection mass join ────────
    if (guildData?.antiraid?.enabled && guildData?.antiraid?.antijoin) {
      const key = `join_${member.guild.id}`;
      const now = Date.now();

      if (!client.antiraid.has(key)) {
        client.antiraid.set(key, { joins: [], raidMode: false });
      }

      const data = client.antiraid.get(key);
      data.joins = data.joins.filter(t => now - t < (guildData.antiraid.joinInterval || 10000));
      data.joins.push(now);

      if (data.joins.length >= (guildData.antiraid.joinThreshold || 10) && !data.raidMode) {
        data.raidMode = true;

        // Activer le mode raid
        const { updateGuildData } = require('../utils/guildUtils');
        await updateGuildData(member.guild.id, { 'antiraid.raidMode': true });

        // Log raid
        const raidEmbed = createEmbed({
          color:       config.colors.error,
          title:       `${config.emojis.raid} MODE RAID ACTIVÉ`,
          description: `**${data.joins.length}** membres ont rejoint en moins de ${guildData.antiraid.joinInterval / 1000}s.\nMode raid activé automatiquement.`,
          guild:       guildData,
        });
        await sendLog(member.guild, 'raidlogs', raidEmbed, guildData);
      }

      // Si mode raid actif, punir
      if (guildData.antiraid.raidMode || data.raidMode) {
        const punishment = guildData.antiraid.punishment || 'ban';
        if (punishment === 'ban') await member.ban({ reason: 'Antiraid — Mode raid actif' }).catch(() => {});
        else if (punishment === 'kick') await member.kick('Antiraid — Mode raid actif').catch(() => {});
        return;
      }

      // Antibot
      if (guildData.antiraid.antibot && member.user.bot) {
        await member.kick('Antiraid — Bot non autorisé').catch(() => {});
        const embed = createEmbed({ color: config.colors.error, title: `${config.emojis.raid} Bot Expulsé`, description: `**${member.user.tag}** a été expulsé (antibot).`, guild: guildData });
        await sendLog(member.guild, 'raidlogs', embed, guildData);
        return;
      }
    }

    // ── Log d'arrivée ─────────────────────────
    const joinEmbed = createEmbed({
      color:       config.colors.success,
      title:       `${config.emojis.invite} Nouveau Membre`,
      description: `${member} a rejoint le serveur.`,
      fields: [
        { name: `${config.emojis.user} Membre`,       value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
        { name: `${config.emojis.time} Compte créé`,  value: discordTimestamp(member.user.createdAt), inline: true },
        { name: `${config.emojis.user} Membres`,      value: formatNumber(member.guild.memberCount), inline: true },
      ],
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      guild:     guildData,
    });

    await sendLog(member.guild, 'joinlogs', joinEmbed, guildData);

    // ── Message de bienvenue ───────────────────
    if (guildData?.joinMessage?.enabled && guildData?.joinMessage?.channelId) {
      const channel = member.guild.channels.cache.get(guildData.joinMessage.channelId);
      if (!channel) return;

      const text = (guildData.joinMessage.message || 'Bienvenue {user} sur **{server}** !')
        .replace(/{user}/g, `${member}`)
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, formatNumber(member.guild.memberCount));

      if (guildData.joinMessage.embed) {
        const welcomeEmbed = createEmbed({
          color:       guildData.color || config.colors.main,
          description: text,
          thumbnail:   member.user.displayAvatarURL({ dynamic: true }),
          guild:       guildData,
        });
        await channel.send({ embeds: [welcomeEmbed] }).catch(() => {});
      } else {
        await channel.send(text).catch(() => {});
      }
    }
  },
};
