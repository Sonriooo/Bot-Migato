const { successEmbed, errorEmbed } = require('../../utils/embed');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  name: 'gdelete', aliases: ['giveaway-delete', 'gdel'],
  description: 'Supprime un giveaway.', usage: '<ID>', category: 'Giveaway', permLevel: 6, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const identifier = args[0];
    const giveaway   = await Giveaway.findOne({
      guildId: message.guild.id,
      $or: [{ giveawayId: identifier.startsWith('#') ? identifier : `#${identifier}` }, { messageId: identifier }],
    });
    if (!giveaway) return message.reply({ embeds: [errorEmbed(`Giveaway \`${identifier}\` introuvable.`, null, guildData)] });
    await Giveaway.findByIdAndDelete(giveaway._id);
    // Supprimer le message si possible
    const channel = message.guild.channels.cache.get(giveaway.channelId);
    if (channel) {
      const msg = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (msg) await msg.delete().catch(() => {});
    }
    await message.reply({ embeds: [successEmbed(`Giveaway \`${giveaway.giveawayId}\` supprimé.`, null, guildData)] });
  },
};
