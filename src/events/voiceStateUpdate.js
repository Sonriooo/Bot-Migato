/**
 * ─────────────────────────────────────────────
 *   Événement — voiceStateUpdate
 *   Log des mouvements vocaux + salons temporaires
 * ─────────────────────────────────────────────
 */

const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const config   = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');
const TempVoc  = require('../models/TempVoc');

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(client, oldState, newState) {
    const member    = newState.member || oldState.member;
    const guild     = newState.guild  || oldState.guild;
    const guildData = await getGuildData(guild.id).catch(() => null);

    // ── Log vocal ─────────────────────────────
    let action = null;
    let description = '';

    if (!oldState.channel && newState.channel) {
      action      = 'join';
      description = `${member} a rejoint **${newState.channel.name}**`;
    } else if (oldState.channel && !newState.channel) {
      action      = 'leave';
      description = `${member} a quitté **${oldState.channel.name}**`;
    } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      action      = 'move';
      description = `${member} s'est déplacé de **${oldState.channel.name}** vers **${newState.channel.name}**`;
    }

    if (action) {
      const colors = { join: config.colors.success, leave: config.colors.error, move: config.colors.warning };
      const embed  = createEmbed({
        color:       colors[action],
        title:       `🔊 Vocal — ${action === 'join' ? 'Connexion' : action === 'leave' ? 'Déconnexion' : 'Déplacement'}`,
        description,
        thumbnail:   member.user.displayAvatarURL({ dynamic: true }),
        guild:       guildData,
      });
      await sendLog(guild, 'voicelogs', embed, guildData);
    }

    // ── Salons vocaux temporaires ──────────────
    if (guildData?.tempVoc?.enabled && guildData?.tempVoc?.channelId) {
      // Création d'un salon temporaire
      if (newState.channel?.id === guildData.tempVoc.channelId) {
        const category = guildData.tempVoc.categoryId
          ? guild.channels.cache.get(guildData.tempVoc.categoryId)
          : newState.channel.parent;

        const tempChannel = await guild.channels.create({
          name:   `🔊 ${member.displayName}`,
          type:   ChannelType.GuildVoice,
          parent: category,
          permissionOverwrites: [
            {
              id:    member.id,
              allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers],
            },
          ],
        }).catch(() => null);

        if (tempChannel) {
          await member.voice.setChannel(tempChannel).catch(() => {});
          await TempVoc.create({
            channelId: tempChannel.id,
            guildId:   guild.id,
            ownerId:   member.id,
            name:      tempChannel.name,
          });
        }
      }

      // Suppression si vide
      if (oldState.channel) {
        const tempVoc = await TempVoc.findOne({ channelId: oldState.channel.id });
        if (tempVoc && oldState.channel.members.size === 0) {
          await oldState.channel.delete('Salon temporaire vide').catch(() => {});
          await TempVoc.findByIdAndDelete(tempVoc._id);
        }
      }
    }
  },
};
