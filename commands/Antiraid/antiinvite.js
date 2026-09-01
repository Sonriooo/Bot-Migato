const { successEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const config = require('../../config/config');
module.exports = {
  name: 'antiinvite', aliases: ['anti-invite', 'noinvite'],
  description: 'Active/désactive la suppression des liens d\'invitation Discord.', usage: '<on|off>', category: 'Antiraid', permLevel: 6, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const enabled = args[0].toLowerCase() === 'on';
    await updateGuildData(message.guild.id, { 'antiraid.antiinvite': enabled });
    await message.reply({ embeds: [successEmbed(`Anti-Invites **${enabled ? 'activé' : 'désactivé'}**.`, `${config.emojis.raid} Anti-Invites`, guildData)] });
  },
};
