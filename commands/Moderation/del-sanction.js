/**
 * ─────────────────────────────────────────────
 *   Commande — &del-sanction
 *   Supprime une sanction par son ID
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const Sanction = require('../../models/Sanction');

module.exports = {
  name:        'del-sanction',
  aliases:     ['delsanction', 'removesanction', 'ds'],
  description: 'Supprime une sanction de l\'historique par son ID.',
  usage:       '<ID>',
  category:    'Moderation',
  permLevel:   6,
  cooldown:    3000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const sanctionId = args[0].startsWith('#') ? args[0] : `#${args[0]}`;

    const sanction = await Sanction.findOne({
      guildId:    message.guild.id,
      sanctionId,
    });

    if (!sanction) {
      return message.reply({ embeds: [errorEmbed(`Sanction \`${sanctionId}\` introuvable.`, null, guildData)] });
    }

    await Sanction.findByIdAndDelete(sanction._id);

    await message.reply({
      embeds: [successEmbed(
        `La sanction \`${sanctionId}\` a été supprimée de l'historique.`,
        `${config.emojis.trash} Sanction Supprimée`, guildData
      )],
    });
  },
};
