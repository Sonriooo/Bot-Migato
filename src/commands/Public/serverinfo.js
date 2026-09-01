/**
 * ─────────────────────────────────────────────
 *   Commande — &serverinfo
 *   Informations détaillées sur le serveur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { discordTimestamp, formatNumber } = require('../../utils/format');

module.exports = {
  name:        'serverinfo',
  aliases:     ['si', 'server', 'guild', 'guildinfo'],
  description: 'Affiche les informations détaillées du serveur.',
  usage:       '',
  category:    'Public',
  permLevel:   0,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;
    const guild = message.guild;

    await guild.fetch();

    const members  = guild.members.cache;
    const humans   = members.filter(m => !m.user.bot).size;
    const bots     = members.filter(m => m.user.bot).size;
    const online   = members.filter(m => m.presence?.status === 'online').size;
    const channels = guild.channels.cache;
    const text     = channels.filter(c => c.type === 0).size;
    const voice    = channels.filter(c => c.type === 2).size;
    const category = channels.filter(c => c.type === 4).size;

    const verificationLevels = {
      0: 'Aucune',
      1: 'Faible',
      2: 'Moyenne',
      3: 'Élevée',
      4: 'Très élevée',
    };

    const boostTiers = {
      0: 'Aucun boost',
      1: 'Niveau 1',
      2: 'Niveau 2',
      3: 'Niveau 3',
    };

    const embed = createEmbed({
      color,
      author: {
        name:    guild.name,
        iconURL: guild.iconURL({ dynamic: true }),
      },
      thumbnail: guild.iconURL({ dynamic: true, size: 256 }),
      image:     guild.bannerURL({ size: 1024 }) || null,
      fields: [
        { name: `${config.emojis.user} Propriétaire`,     value: `<@${guild.ownerId}>`, inline: true },
        { name: `${config.emojis.list} ID`,               value: `\`${guild.id}\``, inline: true },
        { name: `${config.emojis.time} Créé le`,          value: discordTimestamp(guild.createdAt), inline: true },
        { name: `${config.emojis.user} Membres`,          value: `👥 ${formatNumber(humans)} humains\n🤖 ${formatNumber(bots)} bots\n🟢 ${formatNumber(online)} en ligne`, inline: true },
        { name: `${config.emojis.channel} Salons`,        value: `💬 ${text} texte\n🔊 ${voice} vocal\n📁 ${category} catégories`, inline: true },
        { name: `${config.emojis.role} Rôles`,            value: `${formatNumber(guild.roles.cache.size)}`, inline: true },
        { name: `${config.emojis.star} Boosts`,           value: `${boostTiers[guild.premiumTier]} (${guild.premiumSubscriptionCount || 0} boosts)`, inline: true },
        { name: `${config.emojis.shield} Vérification`,   value: verificationLevels[guild.verificationLevel] || 'Inconnue', inline: true },
        { name: `${config.emojis.star} Emojis`,           value: `${guild.emojis.cache.size}`, inline: true },
      ],
      guild: guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
