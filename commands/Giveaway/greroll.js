/**
 * ─────────────────────────────────────────────
 *   Commande — &greroll
 *   Relance le tirage d'un giveaway terminé
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { rerollGiveaway } = require('../../utils/giveawayUtils');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  name:        'greroll',
  aliases:     ['gw-reroll', 'reroll'],
  description: 'Relance le tirage d\'un giveaway terminé.',
  usage:       '<ID | messageID>',
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
    });

    if (!giveaway) {
      return message.reply({ embeds: [errorEmbed(`Giveaway \`${identifier}\` introuvable.`, null, guildData)] });
    }

    if (giveaway.status !== 'ended') {
      return message.reply({ embeds: [errorEmbed('Ce giveaway n\'est pas encore terminé.', null, guildData)] });
    }

    const newWinners = await rerollGiveaway(client, giveaway._id);

    if (!newWinners || newWinners.length === 0) {
      return message.reply({ embeds: [errorEmbed('Aucun participant éligible pour le reroll.', null, guildData)] });
    }

    await message.reply({
      embeds: [successEmbed(
        `Reroll effectué pour **${giveaway.prize}** !\n**Nouveaux gagnants :** ${newWinners.map(id => `<@${id}>`).join(', ')}`,
        `🎉 Reroll Giveaway`, guildData
      )],
    });
  },
};
