/**
 * ─────────────────────────────────────────────
 *   Commande — &ping
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');

module.exports = {
  name:        'ping',
  aliases:     ['latence', 'latency'],
  description: 'Affiche la latence du bot et de l\'API Discord.',
  usage:       '',
  category:    'Public',
  permLevel:   0,
  cooldown:    3000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const sent = await message.reply({
      embeds: [createEmbed({
        color,
        title:       `${config.emojis.ping} Calcul du ping...`,
        description: 'Veuillez patienter...',
        timestamp:   false,
        guild:       guildData,
      })],
    });

    const botLatency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const getStatus = (ms) => {
      if (ms < 100) return '🟢 Excellent';
      if (ms < 200) return '🟡 Bon';
      if (ms < 400) return '🟠 Moyen';
      return '🔴 Mauvais';
    };

    await sent.edit({
      embeds: [createEmbed({
        color,
        title:       `${config.emojis.ping} Pong !`,
        description: `Voici les informations de latence du bot.`,
        fields: [
          { name: `${config.emojis.bot} Latence Bot`,  value: `\`${botLatency}ms\` — ${getStatus(botLatency)}`, inline: true },
          { name: `${config.emojis.link} API Discord`, value: `\`${apiLatency}ms\` — ${getStatus(apiLatency)}`, inline: true },
          { name: `${config.emojis.server} Serveurs`,  value: `\`${client.guilds.cache.size}\``, inline: true },
        ],
        thumbnail: client.user.displayAvatarURL({ dynamic: true }),
        guild:     guildData,
      })],
    });
  },
};
