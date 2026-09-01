/**
 * ─────────────────────────────────────────────
 *   Commande — &banner
 *   Affiche la bannière d'un utilisateur
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name:        'banner',
  aliases:     ['userbanner', 'profilebanner'],
  description: 'Affiche la bannière de profil d\'un utilisateur.',
  usage:       '[@membre]',
  category:    'Public',
  permLevel:   0,
  cooldown:    3000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const target = message.mentions.users.first()
      || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
      || message.author;

    if (!target) {
      return message.reply({ embeds: [errorEmbed('Utilisateur introuvable.', null, guildData)] });
    }

    const user = await target.fetch();

    if (!user.banner) {
      return message.reply({
        embeds: [errorEmbed(
          `**${user.tag}** n'a pas de bannière de profil.`,
          null, guildData
        )],
      });
    }

    const bannerUrl = user.bannerURL({ dynamic: true, size: 4096 });

    const embed = createEmbed({
      color,
      title:  `${config.emojis.eye} Bannière de ${user.tag}`,
      image:  bannerUrl,
      fields: [
        { name: `${config.emojis.link} Lien direct`, value: `[Cliquez ici](${bannerUrl})`, inline: true },
      ],
      guild: guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
