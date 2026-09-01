/**
 * ─────────────────────────────────────────────
 *   Commande — &whitelist
 *   Gère la whitelist des serveurs autorisés
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');
const Buyer = require('../../models/Buyer');

module.exports = {
  name:        'whitelist',
  aliases:     ['wl', 'addserver'],
  description: 'Gère la whitelist des serveurs autorisés à utiliser le bot.',
  usage:       '<add|remove|list> [guildId]',
  category:    'Buyer',
  permLevel:   11,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    // Réservé au bot owner uniquement
    if (message.author.id !== config.botOwner) {
      return message.reply({ embeds: [errorEmbed('Cette commande est réservée au développeur du bot.', null, guildData)] });
    }

    const action  = args[0].toLowerCase();
    const guildId = args[1];

    if (action === 'list') {
      const buyers = await Buyer.find({ whitelist: { $exists: true, $ne: [] } });
      const wlGuilds = buyers.flatMap(b => b.whitelist || []);
      const embed = createEmbed({
        color:       guildData?.color || config.colors.main,
        title:       `${config.emojis.shield} Serveurs Whitelistés`,
        description: wlGuilds.length > 0 ? wlGuilds.map(id => `\`${id}\``).join('\n') : 'Aucun serveur whitelisté.',
        guild:       guildData,
      });
      return message.reply({ embeds: [embed] });
    }

    if (!guildId) return message.reply({ embeds: [errorEmbed('Veuillez spécifier un ID de serveur.', null, guildData)] });

    if (action === 'add') {
      await Buyer.findOneAndUpdate(
        { userId: message.author.id },
        { $addToSet: { whitelist: guildId } },
        { upsert: true }
      );
      await message.reply({ embeds: [successEmbed(`Serveur \`${guildId}\` ajouté à la whitelist.`, null, guildData)] });

    } else if (action === 'remove') {
      await Buyer.findOneAndUpdate(
        { userId: message.author.id },
        { $pull: { whitelist: guildId } }
      );
      await message.reply({ embeds: [successEmbed(`Serveur \`${guildId}\` retiré de la whitelist.`, null, guildData)] });

    } else {
      return message.reply({ embeds: [errorEmbed('Action invalide. Options : `add`, `remove`, `list`', null, guildData)] });
    }
  },
};
