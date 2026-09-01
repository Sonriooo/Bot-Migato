const config   = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { discordTimestamp } = require('../../utils/format');
const { paginate, chunkArray } = require('../../utils/pagination');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  name: 'glist', aliases: ['giveaways', 'giveaway-list'],
  description: 'Liste les giveaways actifs du serveur.', usage: '', category: 'Giveaway', permLevel: 3, cooldown: 5000,
  async execute(client, message, args, guildData) {
    const color     = guildData?.color || config.colors.main;
    const giveaways = await Giveaway.find({ guildId: message.guild.id, status: 'active' }).sort({ endsAt: 1 });
    if (giveaways.length === 0) return message.reply({ embeds: [createEmbed({ color, title: '🎉 Giveaways Actifs', description: 'Aucun giveaway actif.', guild: guildData })] });
    const chunks = chunkArray(giveaways, 5);
    const pages  = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `🎉 Giveaways Actifs (${giveaways.length}) — Page ${i + 1}/${chunks.length}`,
      fields:      chunk.map(g => ({
        name:   `${g.giveawayId} — ${g.prize}`,
        value:  `**Gagnants :** ${g.winners} | **Participants :** ${g.participants.length}\n**Se termine :** ${discordTimestamp(g.endsAt, 'R')}\n**Salon :** <#${g.channelId}>`,
        inline: false,
      })),
      guild: guildData,
    }));
    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
