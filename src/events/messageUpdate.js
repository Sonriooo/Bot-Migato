/**
 * ─────────────────────────────────────────────
 *   Événement — messageUpdate
 *   Log d'édition de message
 * ─────────────────────────────────────────────
 */

const { Events } = require('discord.js');
const config     = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');
const { discordTimestamp, truncate } = require('../utils/format');

module.exports = {
  name: Events.MessageUpdate,

  async execute(client, oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    // Enregistrer pour editsnipe
    client.editSnipes.set(newMessage.channel.id, {
      before:  oldMessage.content || '',
      after:   newMessage.content || '',
      author:  newMessage.author,
      editedAt:new Date(),
    });

    const guildData = await getGuildData(newMessage.guild.id).catch(() => null);

    const embed = createEmbed({
      color:       config.colors.warning,
      title:       `${config.emojis.edit} Message Édité`,
      fields: [
        { name: `${config.emojis.user} Auteur`,    value: `${newMessage.author} (\`${newMessage.author.id}\`)`, inline: true },
        { name: `${config.emojis.channel} Salon`,  value: `${newMessage.channel}`, inline: true },
        { name: `${config.emojis.time} Édité`,     value: discordTimestamp(new Date()), inline: true },
        { name: '📝 Avant',                        value: truncate(oldMessage.content || '*[Vide]*', 512), inline: false },
        { name: '✅ Après',                        value: truncate(newMessage.content || '*[Vide]*', 512), inline: false },
      ],
      thumbnail: newMessage.author.displayAvatarURL({ dynamic: true }),
      guild:     guildData,
    });

    await sendLog(newMessage.guild, 'msglogs', embed, guildData);
  },
};
