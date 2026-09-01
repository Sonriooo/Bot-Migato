/**
 * ─────────────────────────────────────────────
 *   Commande — &giveaway
 *   Lance un giveaway complet avec bouton
 * ─────────────────────────────────────────────
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { parseDuration, formatDuration, discordTimestamp } = require('../../utils/format');
const { startGiveaway } = require('../../utils/giveawayUtils');

module.exports = {
  name:        'giveaway',
  aliases:     ['gw', 'gcreate', 'gstart'],
  description: 'Lance un giveaway dans le salon actuel.',
  usage:       '<durée> <nb_gagnants>w <prix>',
  category:    'Giveaway',
  permLevel:   5,
  cooldown:    10000,
  args:        true,
  minArgs:     3,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;

    const duration = parseDuration(args[0]);
    if (!duration) {
      return message.reply({ embeds: [errorEmbed('Durée invalide. Exemples : `10m`, `1h`, `2d`.', null, guildData)] });
    }

    const winnersArg = args[1];
    if (!winnersArg.endsWith('w') || isNaN(parseInt(winnersArg))) {
      return message.reply({ embeds: [errorEmbed('Format gagnants invalide. Exemple : `1w`, `3w`.', null, guildData)] });
    }

    const winners = parseInt(winnersArg);
    const prize   = args.slice(2).join(' ');
    const endsAt  = new Date(Date.now() + duration);

    const embed = createEmbed({
      color,
      title:       `🎉 GIVEAWAY — ${prize}`,
      description: `Cliquez sur 🎉 pour participer !\n\n` +
                   `**Organisateur :** ${message.author}\n` +
                   `**Gagnant(s) :** ${winners}\n` +
                   `**Se termine :** ${discordTimestamp(endsAt, 'R')} (${discordTimestamp(endsAt)})`,
      footer:      { text: `Participants : 0 | Giveaway ID : ...` },
      guild:       guildData,
    });

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('Participer')
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Primary),
    );

    await message.delete().catch(() => {});
    const gwMessage = await message.channel.send({ embeds: [embed], components: [button] });

    // Mettre à jour l'embed avec l'ID du giveaway
    const giveaway = await startGiveaway({
      guildId:    message.guild.id,
      channelId:  message.channel.id,
      messageId:  gwMessage.id,
      hostId:     message.author.id,
      prize,
      winners,
      duration,
      endsAt,
    });

    const updatedEmbed = createEmbed({
      color,
      title:       `🎉 GIVEAWAY — ${prize}`,
      description: `Cliquez sur 🎉 pour participer !\n\n` +
                   `**Organisateur :** ${message.author}\n` +
                   `**Gagnant(s) :** ${winners}\n` +
                   `**Se termine :** ${discordTimestamp(endsAt, 'R')} (${discordTimestamp(endsAt)})`,
      footer:      { text: `Participants : 0 | ID : ${giveaway.giveawayId}` },
      guild:       guildData,
    });

    await gwMessage.edit({ embeds: [updatedEmbed], components: [button] });

    // Planifier la fin
    setTimeout(async () => {
      const { endGiveaway } = require('../../utils/giveawayUtils');
      await endGiveaway(client, giveaway._id);
    }, duration);
  },
};
