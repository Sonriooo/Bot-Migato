const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
const config = require('../../config/config');

module.exports = {
  name: 'raidlogs', aliases: ['setraidlogs'],
  description: 'Configure le salon des logs anti-raid.',
  usage: '<#salon | disable>', category: 'Logs', permLevel: 7, cooldown: 3000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    if (args[0].toLowerCase() === 'disable') {
      await updateGuildData(message.guild.id, { 'logs.raidlogs': null });
      return message.reply({ embeds: [successEmbed('Logs raid **désactivés**.', null, guildData)] });
    }
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel || channel.type !== 0) return message.reply({ embeds: [errorEmbed('Salon introuvable.', null, guildData)] });
    await updateGuildData(message.guild.id, { 'logs.raidlogs': channel.id });
    await message.reply({ embeds: [successEmbed(`Logs raid configurés sur ${channel}.`, `${config.emojis.raid} Raidlogs`, guildData)] });
  },
};
