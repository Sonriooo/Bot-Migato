const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const config = require('../../config/config');
module.exports = {
  name: 'antimentions', aliases: ['anti-mentions', 'nomentions'],
  description: 'Configure la protection anti mass-mentions.', usage: '<on|off> [seuil]', category: 'Antiraid', permLevel: 6, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const enabled   = args[0].toLowerCase() === 'on';
    const threshold = parseInt(args[1]) || 5;
    await updateGuildData(message.guild.id, { 'antiraid.antimentions': enabled, 'antiraid.mentionThreshold': threshold });
    await message.reply({ embeds: [successEmbed(`Anti-Mentions **${enabled ? 'activé' : 'désactivé'}**${enabled ? ` (seuil : ${threshold} mentions)` : ''}.`, `${config.emojis.raid} Anti-Mentions`, guildData)] });
  },
};
