const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const config = require('../../config/config');
module.exports = {
  name: 'antilinks', aliases: ['anti-links', 'nolinks'],
  description: 'Active/désactive la suppression automatique des liens.', usage: '<on|off>', category: 'Antiraid', permLevel: 6, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const enabled = args[0].toLowerCase() === 'on';
    await updateGuildData(message.guild.id, { 'antiraid.antilinks': enabled });
    await message.reply({ embeds: [successEmbed(`Anti-Liens **${enabled ? 'activé' : 'désactivé'}**. Les liens seront automatiquement supprimés.`, `${config.emojis.raid} Anti-Liens`, guildData)] });
  },
};
