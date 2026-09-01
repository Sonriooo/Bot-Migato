/**
 * ─────────────────────────────────────────────
 *   Commande — &backup
 *   Sauvegarde la configuration du serveur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, loadingEmbed, createEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name:        'backup',
  aliases:     ['save', 'sauvegarde'],
  description: 'Sauvegarde la configuration complète du serveur en base de données.',
  usage:       '',
  category:    'Owner',
  permLevel:   9,
  cooldown:    30000,

  async execute(client, message, args, guildData) {
    const reply = await message.reply({ embeds: [loadingEmbed('Sauvegarde de la configuration en cours...', guildData)] });

    const guild = message.guild;

    // Collecter les données du serveur
    const backup = {
      name:          guild.name,
      icon:          guild.iconURL({ dynamic: true }),
      banner:        guild.bannerURL(),
      description:   guild.description,
      roles:         guild.roles.cache.map(r => ({
        id:       r.id,
        name:     r.name,
        color:    r.hexColor,
        hoist:    r.hoist,
        position: r.position,
        perms:    r.permissions.bitfield.toString(),
      })),
      channels:      guild.channels.cache.map(c => ({
        id:       c.id,
        name:     c.name,
        type:     c.type,
        position: c.position,
        parent:   c.parentId,
        topic:    c.topic,
        nsfw:     c.nsfw,
      })),
      memberCount:   guild.memberCount,
      savedAt:       new Date(),
    };

    await Guild.findOneAndUpdate(
      { guildId: guild.id },
      { backup },
      { upsert: true }
    );

    const embed = createEmbed({
      color:       config.colors.success,
      title:       `${config.emojis.success} Sauvegarde Effectuée`,
      description: `La configuration du serveur a été sauvegardée avec succès.`,
      fields: [
        { name: `${config.emojis.role} Rôles`,    value: `${backup.roles.length}`, inline: true },
        { name: `${config.emojis.channel} Salons`, value: `${backup.channels.length}`, inline: true },
        { name: `${config.emojis.user} Membres`,   value: `${backup.memberCount}`, inline: true },
        { name: `${config.emojis.time} Date`,       value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
      ],
      guild: guildData,
    });

    await reply.edit({ embeds: [embed] });
  },
};
