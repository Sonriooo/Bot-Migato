/**
 * ─────────────────────────────────────────────
 *   Commande — &mutelist
 *   Liste les membres actuellement mutés
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { discordTimestamp } = require('../../utils/format');
const { paginate, chunkArray } = require('../../utils/pagination');

module.exports = {
  name:        'mutelist',
  aliases:     ['muted', 'liste-mutes'],
  description: 'Affiche la liste des membres actuellement mutés.',
  usage:       '',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const color   = guildData?.color || config.colors.main;
    const members = await message.guild.members.fetch();

    // Membres avec timeout actif
    const muted = members.filter(m =>
      m.communicationDisabledUntil && m.communicationDisabledUntil > new Date()
    );

    // Membres avec rôle mute
    const muteRole = guildData?.muteRole;
    const rolesMuted = muteRole
      ? members.filter(m => m.roles.cache.has(muteRole) && !muted.has(m.id))
      : new Map();

    const allMuted = [...muted.values(), ...rolesMuted.values()];

    if (allMuted.length === 0) {
      return message.reply({
        embeds: [createEmbed({
          color,
          title:       `${config.emojis.mute} Liste des Mutés`,
          description: 'Aucun membre actuellement muté.',
          guild:       guildData,
        })],
      });
    }

    const chunks = chunkArray(allMuted, 10);

    const pages = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `${config.emojis.mute} Membres Mutés — Page ${i + 1}/${chunks.length}`,
      description: `**${allMuted.length}** membre(s) muté(s)`,
      fields:      chunk.map(m => ({
        name:   m.user.tag,
        value:  m.communicationDisabledUntil
          ? `Timeout jusqu'à : ${discordTimestamp(m.communicationDisabledUntil)}`
          : 'Rôle mute',
        inline: true,
      })),
      guild: guildData,
    }));

    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
