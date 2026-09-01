/**
 * ─────────────────────────────────────────────
 *   Commande — &sanction
 *   Affiche l'historique des sanctions d'un membre
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { paginate, chunkArray } = require('../../utils/pagination');
const { discordTimestamp } = require('../../utils/format');
const Sanction = require('../../models/Sanction');

const typeEmojis = {
  ban:      '🔨',
  tempban:  '🔨',
  kick:     '👢',
  mute:     '🔇',
  tempmute: '🔇',
  warn:     '⚠️',
  unmute:   '✅',
  unban:    '✅',
  derank:   '➖',
};

module.exports = {
  name:        'sanction',
  aliases:     ['sanctions', 'history', 'historique'],
  description: 'Affiche l\'historique des sanctions d\'un membre.',
  usage:       '<@membre>',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const color  = guildData?.color || config.colors.main;
    const target = message.mentions.users.first()
      || await client.users.fetch(args[0]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Utilisateur introuvable.', null, guildData)] });

    const sanctions = await Sanction.find({
      guildId: message.guild.id,
      userId:  target.id,
    }).sort({ createdAt: -1 });

    if (sanctions.length === 0) {
      return message.reply({
        embeds: [createEmbed({
          color,
          title:       `${config.emojis.shield} Historique de ${target.tag}`,
          description: 'Aucune sanction enregistrée pour ce membre.',
          thumbnail:   target.displayAvatarURL({ dynamic: true }),
          guild:       guildData,
        })],
      });
    }

    const chunks = chunkArray(sanctions, 5);

    const pages = chunks.map((chunk, i) => createEmbed({
      color,
      title:       `${config.emojis.shield} Sanctions de ${target.tag} — Page ${i + 1}/${chunks.length}`,
      description: `**${sanctions.length}** sanction(s) au total`,
      thumbnail:   target.displayAvatarURL({ dynamic: true }),
      fields:      chunk.map(s => ({
        name:   `${typeEmojis[s.type] || '•'} [${s.sanctionId}] ${s.type.toUpperCase()}`,
        value:  `**Raison :** ${s.reason}\n**Modérateur :** <@${s.moderatorId}>\n**Date :** ${discordTimestamp(s.createdAt)}\n**Actif :** ${s.active ? '✅' : '❌'}`,
        inline: false,
      })),
      guild: guildData,
    }));

    const reply = await message.reply({ embeds: [pages[0]] });
    await paginate(reply, pages, message.author);
  },
};
