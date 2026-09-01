/**
 * ─────────────────────────────────────────────
 *   Commande — &blacklist
 *   Bannit des utilisateurs de l'utilisation du bot
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed, createEmbed } = require('../../utils/embed');
const Buyer = require('../../models/Buyer');

module.exports = {
  name:        'blacklist',
  aliases:     ['bl', 'botban'],
  description: 'Gère la blacklist des utilisateurs bannis du bot.',
  usage:       '<add|remove|list> [@utilisateur | userId]',
  category:    'Buyer',
  permLevel:   11,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    if (message.author.id !== config.botOwner) {
      return message.reply({ embeds: [errorEmbed('Cette commande est réservée au développeur du bot.', null, guildData)] });
    }

    const action = args[0].toLowerCase();

    if (action === 'list') {
      const buyers = await Buyer.find({ banned: true });
      const blUsers = buyers.map(b => b.userId);
      const embed = createEmbed({
        color:       guildData?.color || config.colors.main,
        title:       `${config.emojis.ban} Utilisateurs Blacklistés`,
        description: blUsers.length > 0 ? blUsers.map(id => `<@${id}> (\`${id}\`)`).join('\n') : 'Aucun utilisateur blacklisté.',
        guild:       guildData,
      });
      return message.reply({ embeds: [embed] });
    }

    const target = message.mentions.users.first()
      || await client.users.fetch(args[1]).catch(() => null);

    if (!target) return message.reply({ embeds: [errorEmbed('Utilisateur introuvable.', null, guildData)] });
    if (target.id === config.botOwner || target.id === client.user.id) {
      return message.reply({ embeds: [errorEmbed('Tu ne peux pas blacklist le propriétaire ou le bot lui-même.', null, guildData)] });
    }

    if (action === 'add') {
      await Buyer.findOneAndUpdate(
        { userId: target.id },
        { userId: target.id, banned: true, active: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await message.reply({ embeds: [successEmbed(`**${target.tag}** a été blacklisté du bot.`, null, guildData)] });

    } else if (action === 'remove') {
      await Buyer.findOneAndUpdate(
        { userId: target.id },
        { banned: false, active: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await message.reply({ embeds: [successEmbed(`**${target.tag}** a été retiré de la blacklist.`, null, guildData)] });

    } else {
      return message.reply({ embeds: [errorEmbed('Action invalide. Options : `add`, `remove`, `list`', null, guildData)] });
    }
  },
};
