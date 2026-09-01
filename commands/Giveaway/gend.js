/**
 * ─────────────────────────────────────────────
 *   Commande — &gend
 *   Termine un giveaway immédiatement
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { endGiveaway } = require('../../utils/giveawayUtils');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  name:        'gend',
  aliases:     ['giveaway-end', 'endgiveaway'],
  description: 'Termine un giveaway immédiatement.',
  usage:       '<ID>',
  category:    'Giveaway',
  permLevel:   5,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const identifier = args[0];

    const giveaway = await Giveaway.findOne({
      guildId: message.guild.id,
      $or: [
        { giveawayId: identifier.startsWith('#') ? identifier : `#${identifier}` },
        { messageId:  identifier },
      ],
      status: 'active',
    });

    if (!giveaway) {
      return message.reply({ embeds: [errorEmbed(`Giveaway actif \`${identifier}\` introuvable.`, null, guildData)] });
    }

    await endGiveaway(client, giveaway._id);

    await message.reply({
      embeds: [successEmbed(
        `Le giveaway **${giveaway.prize}** a été terminé manuellement.`,
        `🎉 Giveaway Terminé`, guildData
      )],
    });
  },
};
