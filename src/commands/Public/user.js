/**
 * ─────────────────────────────────────────────
 *   Commande — &user
 *   Informations détaillées sur un utilisateur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
const { discordTimestamp, formatNumber } = require('../../utils/format');
const { getPermLevel, getPermName } = require('../../utils/permissions');
const Sanction = require('../../models/Sanction');

module.exports = {
  name:        'user',
  aliases:     ['userinfo', 'ui', 'whois', 'profil'],
  description: 'Affiche les informations détaillées d\'un membre.',
  usage:       '[@membre]',
  category:    'Public',
  permLevel:   0,
  cooldown:    3000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    // Résoudre le membre
    const target = message.mentions.members.first()
      || (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null)
      || message.member;

    if (!target) {
      return message.reply({
        embeds: [createEmbed({
          color: config.colors.error,
          title: `${config.emojis.error} Membre introuvable`,
          description: 'Veuillez mentionner un membre valide.',
          guild: guildData,
        })],
      });
    }

    const user    = target.user;
    const permLvl = await getPermLevel(target, guildData);

    // Compter les sanctions
    const sanctions = await Sanction.countDocuments({ guildId: message.guild.id, userId: user.id });
    const warns     = await Sanction.countDocuments({ guildId: message.guild.id, userId: user.id, type: 'warn' });

    // Rôles (sans @everyone)
    const roles = target.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `${r}`)
      .slice(0, 10);

    // Badges
    const flags  = user.flags?.toArray() || [];
    const badges = flags.map(f => {
      const badgeMap = {
        Staff:                  '👨‍💼 Staff Discord',
        Partner:                '🤝 Partenaire',
        Hypesquad:              '🏠 HypeSquad Events',
        BugHunterLevel1:        '🐛 Bug Hunter Niv.1',
        BugHunterLevel2:        '🐛 Bug Hunter Niv.2',
        HypeSquadOnlineHouse1:  '🏠 Bravery',
        HypeSquadOnlineHouse2:  '🏠 Brilliance',
        HypeSquadOnlineHouse3:  '🏠 Balance',
        PremiumEarlySupporter:  '⭐ Early Supporter',
        VerifiedBotDeveloper:   '🤖 Développeur Bot',
        ActiveDeveloper:        '💻 Développeur Actif',
        CertifiedModerator:     '🛡️ Modérateur Certifié',
      };
      return badgeMap[f] || f;
    });

    const embed = createEmbed({
      color,
      author: {
        name:    `${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      },
      thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
      fields: [
        { name: `${config.emojis.user} Identifiant`,      value: `\`${user.id}\``, inline: true },
        { name: `${config.emojis.bot} Bot`,               value: user.bot ? 'Oui' : 'Non', inline: true },
        { name: `${config.emojis.shield} Permission`,     value: getPermName(permLvl), inline: true },
        { name: `${config.emojis.time} Compte créé`,      value: discordTimestamp(user.createdAt), inline: true },
        { name: `${config.emojis.server} A rejoint le`,   value: discordTimestamp(target.joinedAt), inline: true },
        { name: `${config.emojis.star} Pseudo serveur`,   value: target.displayName, inline: true },
        { name: `${config.emojis.warn} Sanctions`,        value: `${sanctions} total | ${warns} avert.`, inline: true },
        { name: `${config.emojis.role} Rôles (${target.roles.cache.size - 1})`, value: roles.length ? roles.join(' ') : 'Aucun', inline: false },
        ...(badges.length ? [{ name: `${config.emojis.star} Badges`, value: badges.join('\n'), inline: false }] : []),
      ],
      guild: guildData,
    });

    // Bannière si disponible
    const fetchedUser = await user.fetch();
    if (fetchedUser.banner) {
      embed.setImage(fetchedUser.bannerURL({ dynamic: true, size: 512 }));
    }

    await message.reply({ embeds: [embed] });
  },
};
