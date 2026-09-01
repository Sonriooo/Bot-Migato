const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');
module.exports = {
  name: 'stickers', aliases: ['stickerlist'],
  description: 'Liste les stickers du serveur.', usage: '', category: 'Gestion', permLevel: 0, cooldown: 5000,
  async execute(client, message, args, guildData) {
    const color    = guildData?.color || config.colors.main;
    const stickers = [...message.guild.stickers.cache.values()];
    if (stickers.length === 0) return message.reply({ embeds: [createEmbed({ color, title: '🎭 Stickers', description: 'Aucun sticker.', guild: guildData })] });
    const chunks = chunkArray(stickers, 10);
    const pages  = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `🎭 Stickers (${stickers.length}) — Page ${i + 1}/${chunks.length}`,
      description: chunk.map(s => `**${s.name}** — \`${s.id}\``).join('\n'),
      guild:       guildData,
    }));
    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
