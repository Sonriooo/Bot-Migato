/**
 * ─────────────────────────────────────────────
 *   Commande — &roleinfo
 *   Informations sur un rôle
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { discordTimestamp, formatNumber } = require('../../utils/format');

module.exports = {
  name:        'roleinfo',
  aliases:     ['ri', 'role'],
  description: 'Affiche les informations détaillées d\'un rôle.',
  usage:       '[@rôle]',
  category:    'Public',
  permLevel:   0,
  cooldown:    3000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const role = message.mentions.roles.first()
      || message.guild.roles.cache.get(args[0])
      || message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());

    if (!role) {
      return message.reply({ embeds: [errorEmbed('Rôle introuvable. Mentionnez un rôle ou donnez son ID.', null, guildData)] });
    }

    const permissions = role.permissions.toArray()
      .map(p => `\`${p}\``)
      .slice(0, 10)
      .join(', ');

    const embed = createEmbed({
      color:  role.hexColor !== '#000000' ? role.hexColor : color,
      title:  `${config.emojis.role} Informations du rôle`,
      fields: [
        { name: `${config.emojis.list} Nom`,         value: role.name, inline: true },
        { name: `${config.emojis.dot} ID`,           value: `\`${role.id}\``, inline: true },
        { name: `${config.emojis.user} Membres`,     value: formatNumber(role.members.size), inline: true },
        { name: `${config.emojis.time} Créé le`,     value: discordTimestamp(role.createdAt), inline: true },
        { name: `${config.emojis.star} Couleur`,     value: role.hexColor, inline: true },
        { name: `${config.emojis.eye} Affiché`,      value: role.hoist ? 'Oui' : 'Non', inline: true },
        { name: `${config.emojis.shield} Mentionnable`, value: role.mentionable ? 'Oui' : 'Non', inline: true },
        { name: `${config.emojis.bot} Géré par bot`, value: role.managed ? 'Oui' : 'Non', inline: true },
        { name: `${config.emojis.arrow} Position`,   value: `${role.position}`, inline: true },
        { name: `${config.emojis.shield} Permissions`, value: permissions || 'Aucune', inline: false },
      ],
      guild: guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
