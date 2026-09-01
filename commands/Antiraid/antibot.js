const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const config = require('../../config/config');
module.exports = {
  name: 'antibot', aliases: ['anti-bot'],
  description: 'Active/désactive la protection anti-bot (expulse les bots non autorisés).', usage: '<on|off>', category: 'Antiraid', permLevel: 8, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const enabled = args[0].toLowerCase() === 'on';
    await updateGuildData(message.guild.id, { 'antiraid.antibot': enabled });
    await message.reply({ embeds: [successEmbed(`Anti-Bot **${enabled ? 'activé' : 'désactivé'}**. Les bots qui rejoignent seront automatiquement expulsés.`, `${config.emojis.raid} Anti-Bot`, guildData)] });
  },
};
