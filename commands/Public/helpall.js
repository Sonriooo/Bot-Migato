/**
 * ─────────────────────────────────────────────
 *   Commande — &helpall
 *   Liste toutes les commandes avec pagination
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');
const { getPermName } = require('../../utils/permissions');

module.exports = {
  name:        'helpall',
  aliases:     ['allcommands', 'allcmds'],
  description: 'Affiche toutes les commandes du bot avec pagination.',
  usage:       '',
  category:    'Public',
  permLevel:   0,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const prefix = guildData?.prefix || config.prefix;
    const color  = guildData?.color  || config.colors.main;

    // Récupérer toutes les commandes sans doublons
    const allCmds = [...new Map([...client.commands.values()].map(cmd => [cmd.name, cmd])).values()];
    const chunks  = chunkArray(allCmds, 10);

    const pages = chunks.map((cmds, i) => createEmbed({
      color,
      title:       `${config.emojis.list} Toutes les commandes — Page ${i + 1}/${chunks.length}`,
      description: cmds.map(cmd =>
        `**\`${prefix}${cmd.name}\`** — ${cmd.description || 'Aucune description.'}\n` +
        `${config.emojis.dot} Catégorie: \`${cmd.category}\` | Perm: \`${getPermName(cmd.permLevel || 0)}\``
      ).join('\n\n'),
      thumbnail: client.user.displayAvatarURL({ dynamic: true }),
      footer: { text: `${allCmds.length} commandes au total • ${config.botName}` },
      guild: guildData,
    }));

    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
