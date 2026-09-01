const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');

module.exports = {
  name: 'banlist', aliases: ['bans', 'banned'],
  description: 'Liste les membres bannis du serveur.', usage: '', category: 'Gestion', permLevel: 5, cooldown: 5000, botPerms: ['BanMembers'],
  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;
    const bans  = await message.guild.bans.fetch();
    if (bans.size === 0) return message.reply({ embeds: [createEmbed({ color, title: `${config.emojis.ban} Bannis`, description: 'Aucun membre banni.', guild: guildData })] });
    const chunks = chunkArray([...bans.values()], 15);
    const pages  = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `${config.emojis.ban} Bannis (${bans.size}) — Page ${i + 1}/${chunks.length}`,
      description: chunk.map(b => `**${b.user.tag}** — ${b.reason || 'Aucune raison'}`).join('\n'),
      guild:       guildData,
    }));
    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
