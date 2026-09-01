/**
 * ─────────────────────────────────────────────
 *   Événement — messageDelete
 *   Log de suppression + snipe
 * ─────────────────────────────────────────────
 */

const { Events } = require('discord.js');
const config     = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');
const { discordTimestamp, truncate } = require('../utils/format');

module.exports = {
  name: Events.MessageDelete,

  async execute(client, message) {
    if (!message.guild || message.author?.bot) return;
    if (!message.content && !message.attachments?.size) return;

    // ── Snipe ─────────────────────────────────
    client.snipes.set(message.channel.id, {
      content:     message.content || '',
      author:      message.author,
      attachments: [...message.attachments.values()].map(a => a.url),
      deletedAt:   new Date(),
    });

    // Nettoyer après 5 minutes
    setTimeout(() => {
      const snipe = client.snipes.get(message.channel.id);
      if (snipe && snipe.deletedAt <= new Date(Date.now() - 300000)) {
        client.snipes.delete(message.channel.id);
      }
    }, 300000);

    // ── Log ───────────────────────────────────
    const guildData = await getGuildData(message.guild.id).catch(() => null);

    const embed = createEmbed({
      color:       config.colors.error,
      title:       `${config.emojis.trash} Message Supprimé`,
      description: truncate(message.content || '*[Pas de contenu]*', 1024),
      fields: [
        { name: `${config.emojis.user} Auteur`,  value: `${message.author} (\`${message.author.id}\`)`, inline: true },
        { name: `${config.emojis.channel} Salon`,value: `${message.channel}`, inline: true },
        { name: `${config.emojis.time} Envoyé`,  value: discordTimestamp(message.createdAt), inline: true },
      ],
      thumbnail: message.author.displayAvatarURL({ dynamic: true }),
      guild:     guildData,
    });

    if (message.attachments?.size > 0) {
      embed.setImage([...message.attachments.values()][0].url);
    }

    await sendLog(message.guild, 'msglogs', embed, guildData);
  },
};
