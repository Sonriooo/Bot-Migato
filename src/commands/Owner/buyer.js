/**
 * ─────────────────────────────────────────────
 *   Commande — &buyer
 *   Gère les acheteurs (buyers) du bot
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const Buyer = require('../../models/Buyer');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');

module.exports = {
  name:        'buyer',
  aliases:     ['addbuyer', 'removebuyer', 'buyers'],
  description: 'Gère les acheteurs du bot (buyers) avec accès complet.',
  usage:       '<add|remove|list> [@utilisateur | userId]',
  category:    'Owner',
  permLevel:   11,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const action = args[0].toLowerCase();

    if (action === 'list') {
      const buyers = await Buyer.find({});
      const list = buyers.filter(b => b.active !== false);

      const embed = createEmbed({
        color: guildData?.color || config.colors.main,
        title: `${config.emojis.premium} Buyers actifs`,
        description: list.length > 0
          ? list.map(b => `<@${b.userId}> (\`${b.userId}\`)`).join('\n')
          : 'Aucun buyer actif pour le moment.',
        guild: guildData,
      });

      return message.reply({ embeds: [embed] });
    }

    const target = message.mentions.users.first()
      || await client.users.fetch(args[1]).catch(() => null);

    if (!target) {
      return message.reply({ embeds: [errorEmbed('Utilisateur introuvable. Mentionnez un membre ou donnez son ID.', null, guildData)] });
    }

    if (action === 'add') {
      await Buyer.findOneAndUpdate(
        { userId: target.id },
        {
          userId: target.id,
          active: true,
          $addToSet: { whitelist: [] },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return message.reply({ embeds: [successEmbed(`**${target.tag}** a été ajouté comme buyer du bot.`, null, guildData)] });
    }

    if (action === 'remove') {
      await Buyer.findOneAndUpdate(
        { userId: target.id },
        { active: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return message.reply({ embeds: [successEmbed(`**${target.tag}** n'est plus buyer actif.`, null, guildData)] });
    }

    return message.reply({ embeds: [errorEmbed('Action invalide. Utilisation : `&buyer add|remove|list [@user|id]`', null, guildData)] });
  },
};
