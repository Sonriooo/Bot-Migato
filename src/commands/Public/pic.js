/**
 * ─────────────────────────────────────────────
 *   Commande — &pic
 *   Affiche l'avatar d'un utilisateur
 * ─────────────────────────────────────────────
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name:        'pic',
  aliases:     ['avatar', 'av', 'pfp'],
  description: 'Affiche l\'avatar d\'un utilisateur en haute résolution.',
  usage:       '[@membre]',
  category:    'Public',
  permLevel:   0,
  cooldown:    3000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const target = message.mentions.members.first()
      || (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null)
      || message.member;

    if (!target) {
      return message.reply({ embeds: [errorEmbed('Membre introuvable.', null, guildData)] });
    }

    const user          = target.user;
    const globalAvatar  = user.displayAvatarURL({ dynamic: true, size: 4096 });
    const serverAvatar  = target.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = createEmbed({
      color,
      title:  `${config.emojis.eye} Avatar de ${user.tag}`,
      image:  serverAvatar,
      guild:  guildData,
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Avatar Global')
        .setStyle(ButtonStyle.Link)
        .setURL(globalAvatar)
        .setEmoji('🌐'),
      new ButtonBuilder()
        .setLabel('Avatar Serveur')
        .setStyle(ButtonStyle.Link)
        .setURL(serverAvatar)
        .setEmoji('🏠'),
    );

    await message.reply({ embeds: [embed], components: [buttons] });
  },
};
