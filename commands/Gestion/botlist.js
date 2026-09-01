const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');

module.exports = {
  name: 'botlist', aliases: ['bots'],
  description: 'Liste les bots du serveur.', usage: '', category: 'Gestion', permLevel: 0, cooldown: 5000,
  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;
    const bots  = [...message.guild.members.cache.filter(m => m.user.bot).values()];
    if (bots.length === 0) return message.reply({ embeds: [createEmbed({ color, title: `${config.emojis.bot} Bots`, description: 'Aucun bot.', guild: guildData })] });
    const chunks = chunkArray(bots, 15);
    const pages  = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `${config.emojis.bot} Bots (${bots.length}) — Page ${i + 1}/${chunks.length}`,
      description: chunk.map(b => `${b} — \`${b.user.tag}\``).join('\n'),
      guild:       guildData,
    }));
    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
