/**
 * ─────────────────────────────────────────────
 *   Commande — &support
 *   Lien de support et d'invitation
 * ─────────────────────────────────────────────
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');

module.exports = {
  name:        'support',
  aliases:     ['invite', 'inv', 'links'],
  description: 'Affiche les liens de support et d\'invitation du bot.',
  usage:       '',
  category:    'Public',
  permLevel:   0,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const embed = createEmbed({
      color,
      title:       `${config.emojis.link} Liens ${config.botName}`,
      description: `Retrouvez tous les liens utiles pour **${config.botName}** ci-dessous.`,
      thumbnail:   client.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: `${config.emojis.invite} Invitation`,   value: `[Inviter le bot](${config.links.invite})`, inline: true },
        { name: `💬 Support`,                           value: `[Serveur Discord](${config.links.support})`, inline: true },
        { name: `${config.emojis.bot} Préfixe`,         value: `\`${guildData?.prefix || config.prefix}\``, inline: true },
      ],
      guild: guildData,
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Inviter le Bot')
        .setEmoji('📨')
        .setStyle(ButtonStyle.Link)
        .setURL(config.links.invite),
      new ButtonBuilder()
        .setLabel('Serveur Support')
        .setEmoji('💬')
        .setStyle(ButtonStyle.Link)
        .setURL(config.links.support),
    );

    await message.reply({ embeds: [embed], components: [buttons] });
  },
};
