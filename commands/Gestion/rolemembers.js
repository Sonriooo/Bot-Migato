const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');

module.exports = {
  name: 'rolemembers', aliases: ['rm', 'inrole'],
  description: 'Liste les membres ayant un rôle spécifique.',
  usage: '<@rôle>', category: 'Gestion', permLevel: 3, cooldown: 5000, args: true, minArgs: 1,
  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;
    const role  = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply({ embeds: [errorEmbed('Rôle introuvable.', null, guildData)] });

    const members = [...role.members.values()];
    if (members.length === 0) return message.reply({ embeds: [createEmbed({ color, title: `Membres avec ${role.name}`, description: 'Aucun membre.', guild: guildData })] });

    const chunks = chunkArray(members, 20);
    const pages  = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `${config.emojis.role} Membres — ${role.name} (${members.length}) — Page ${i + 1}/${chunks.length}`,
      description: chunk.map(m => `${m} (\`${m.user.tag}\`)`).join('\n'),
      guild:       guildData,
    }));
    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
