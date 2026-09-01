/**
 * ─────────────────────────────────────────────
 *   Commande — &perms
 *   Affiche la configuration des permissions
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');

const LEVELS = [
  { level: 0,  name: 'Membre',            desc: 'Accès aux commandes publiques' },
  { level: 1,  name: 'Membre+',           desc: 'Commandes légèrement restreintes' },
  { level: 2,  name: 'Modérateur Junior', desc: 'Commandes de modération basiques' },
  { level: 3,  name: 'Modérateur',        desc: 'Warn, mute, clear, slowmode' },
  { level: 4,  name: 'Modérateur Senior', desc: 'Kick, addrole, delrole' },
  { level: 5,  name: 'Administrateur',    desc: 'Giveaway, embed, poll' },
  { level: 6,  name: 'Administrateur+',   desc: 'Derank, delete, del, nsfw' },
  { level: 7,  name: 'Gestionnaire',      desc: 'Logs, setmute, ticket, tempvoc' },
  { level: 8,  name: 'Co-Owner',          desc: 'Antiraid, lockdown, backup' },
  { level: 9,  name: 'Owner',             desc: 'Toutes les commandes Owner' },
  { level: 10, name: 'Développeur',       desc: 'Accès total (bot owner)' },
];

module.exports = {
  name:        'perms',
  aliases:     ['permissions', 'levels'],
  description: 'Affiche les niveaux de permission et leur configuration.',
  usage:       '',
  category:    'Owner',
  permLevel:   7,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const embed = createEmbed({
      color,
      title:       `${config.emojis.shield} Niveaux de Permission`,
      description: 'Voici les niveaux de permission du bot et les rôles/utilisateurs associés.',
      fields:      LEVELS.map(l => ({
        name:   `Niveau ${l.level} — ${l.name}`,
        value:  l.desc + (guildData?.permissions?.[l.level] ? `\n**Rôles :** ${guildData.permissions[l.level].roles?.map(r => `<@&${r}>`).join(', ') || 'Aucun'}\n**Utilisateurs :** ${guildData.permissions[l.level].users?.map(u => `<@${u}>`).join(', ') || 'Aucun'}` : ''),
        inline: false,
      })),
      footer: { text: 'Utilisez &addperm et &delperm pour modifier les permissions.' },
      guild:  guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
