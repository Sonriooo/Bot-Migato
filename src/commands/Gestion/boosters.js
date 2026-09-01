const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');
const { discordTimestamp } = require('../../utils/format');

module.exports = {
  name: 'boosters', aliases: ['boosts', 'nitro'],
  description: 'Liste les boosters du serveur.', usage: '', category: 'Gestion', permLevel: 0, cooldown: 5000,
  async execute(client, message, args, guildData) {
    const color    = guildData?.color || config.colors.main;
    const boosters = [...message.guild.members.cache.filter(m => m.premiumSince).values()];
    if (boosters.length === 0) return message.reply({ embeds: [createEmbed({ color, title: '⭐ Boosters', description: 'Aucun booster.', guild: guildData })] });
    const chunks = chunkArray(boosters, 15);
    const pages  = chunks.map((chunk, i) => createEmbed({
      color: '#FF73FA',
      title: `⭐ Boosters (${boosters.length}) — Page ${i + 1}/${chunks.length}`,
      description: chunk.map(m => `${m} — ${discordTimestamp(m.premiumSince)}`).join('\n'),
      guild: guildData,
    }));
    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
