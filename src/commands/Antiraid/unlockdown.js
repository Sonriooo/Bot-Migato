const config = require('../../config/config');
const { successEmbed, loadingEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');
module.exports = {
  name: 'unlockdown', aliases: ['unlock', 'unlockall'],
  description: 'Déverrouille tous les salons textuels du serveur.', usage: '', category: 'Antiraid', permLevel: 8, cooldown: 10000, botPerms: ['ManageChannels'],
  async execute(client, message, args, guildData) {
    const reply = await message.reply({ embeds: [loadingEmbed('Déverrouillage de tous les salons...', guildData)] });
    let count = 0;
    for (const [, channel] of message.guild.channels.cache) {
      if (channel.type === 0 || channel.type === 5) {
        await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null }, { reason: `Unlockdown par ${message.author.tag}` }).catch(() => {});
        count++;
      }
    }
    await updateGuildData(message.guild.id, { lockdown: false });
    await reply.edit({ embeds: [successEmbed(`🔓 **Lockdown désactivé** — **${count}** salon(s) déverrouillé(s).`, `${config.emojis.success} Unlockdown`, guildData)] });
  },
};
