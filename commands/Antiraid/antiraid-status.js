const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
module.exports = {
  name: 'antiraid-status', aliases: ['arstatus', 'antiraid-info'],
  description: 'Affiche la configuration complète de l\'antiraid.', usage: '', category: 'Antiraid', permLevel: 5, cooldown: 5000,
  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;
    const ar    = guildData?.antiraid || {};
    const embed = createEmbed({
      color,
      title:       `${config.emojis.raid} Configuration Antiraid`,
      fields: [
        { name: '🛡️ Antiraid Global',    value: ar.enabled      ? '✅ Activé'  : '❌ Désactivé',  inline: true },
        { name: '🚨 Mode Raid',           value: ar.raidMode     ? '🔴 ACTIF'   : '🟢 Inactif',    inline: true },
        { name: '\u200b',                 value: '\u200b',                                          inline: true },
        { name: '🚪 Anti-Join',           value: ar.antijoin     ? `✅ Seuil: ${ar.joinThreshold || 10} en ${(ar.joinInterval || 10000) / 1000}s → ${ar.punishment || 'ban'}` : '❌', inline: false },
        { name: '🤖 Anti-Bot',            value: ar.antibot      ? '✅ Activé'  : '❌ Désactivé',  inline: true },
        { name: '💬 Anti-Spam',           value: ar.antispam     ? `✅ ${ar.spamThreshold || 5} msgs/${(ar.spamInterval || 5000) / 1000}s → ${ar.spamPunishment || 'mute'}` : '❌', inline: false },
        { name: '🔗 Anti-Liens',          value: ar.antilinks    ? '✅ Activé'  : '❌ Désactivé',  inline: true },
        { name: '📨 Anti-Invites',        value: ar.antiinvite   ? '✅ Activé'  : '❌ Désactivé',  inline: true },
        { name: '📣 Anti-Mentions',       value: ar.antimentions ? `✅ Seuil: ${ar.mentionThreshold || 5}` : '❌', inline: true },
      ],
      guild: guildData,
    });
    await message.reply({ embeds: [embed] });
  },
};
