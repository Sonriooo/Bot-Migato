const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');

module.exports = {
  name: 'adminlist', aliases: ['admins', 'mods'],
  description: 'Liste les membres avec des permissions d\'administration.', usage: '', category: 'Gestion', permLevel: 0, cooldown: 5000,
  async execute(client, message, args, guildData) {
    const color  = guildData?.color || config.colors.main;
    const admins = [...message.guild.members.cache.filter(m => !m.user.bot && m.permissions.has('Administrator')).values()];
    const chunks = chunkArray(admins, 15);
    if (admins.length === 0) return message.reply({ embeds: [createEmbed({ color, title: `${config.emojis.shield} Admins`, description: 'Aucun administrateur.', guild: guildData })] });
    const pages = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `${config.emojis.shield} Administrateurs (${admins.length}) — Page ${i + 1}/${chunks.length}`,
      description: chunk.map(m => `${m} — \`${m.user.tag}\``).join('\n'),
      guild:       guildData,
    }));
    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
