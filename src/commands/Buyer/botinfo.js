/**
 * ─────────────────────────────────────────────
 *   Commande — &botinfo
 *   Affiche les informations du bot
 * ─────────────────────────────────────────────
 */

const os     = require('os');
const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { formatNumber } = require('../../utils/format');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return `${d}j ${h % 24}h ${m % 60}m ${s % 60}s`;
}

module.exports = {
  name:        'botinfo',
  aliases:     ['stats', 'about', 'info'],
  description: 'Affiche les informations et statistiques du bot.',
  usage:       '',
  category:    'Buyer',
  permLevel:   0,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const guilds   = client.guilds.cache.size;
    const users    = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const channels = client.channels.cache.size;
    const ping     = client.ws.ping;
    const mem      = process.memoryUsage();
    const uptime   = formatUptime(client.uptime);

    const embed = createEmbed({
      color,
      title:       `${config.emojis.bot} ${client.user.username} — Informations`,
      thumbnail:   client.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: `${config.emojis.user} Développeur`,   value: `<@${config.botOwner}>`, inline: true },
        { name: `${config.emojis.time} Uptime`,        value: uptime, inline: true },
        { name: `${config.emojis.stats} Ping`,         value: `${ping}ms`, inline: true },
        { name: `${config.emojis.server} Serveurs`,    value: formatNumber(guilds), inline: true },
        { name: `${config.emojis.user} Utilisateurs`,  value: formatNumber(users), inline: true },
        { name: `${config.emojis.channel} Salons`,     value: formatNumber(channels), inline: true },
        { name: `${config.emojis.list} Commandes`,     value: `${client.commands.size}`, inline: true },
        { name: `⚙️ Node.js`,                          value: process.version, inline: true },
        { name: `📦 discord.js`,                       value: require('discord.js').version, inline: true },
        { name: `💾 RAM`,                              value: formatBytes(mem.heapUsed), inline: true },
        { name: `🖥️ OS`,                               value: `${os.type()} ${os.arch()}`, inline: true },
        { name: `🔢 Version`,                          value: config.version || '1.0.0', inline: true },
      ],
      footer: { text: `ID : ${client.user.id}` },
      guild:  guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
