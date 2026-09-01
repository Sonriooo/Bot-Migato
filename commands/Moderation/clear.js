/**
 * ─────────────────────────────────────────────
 *   Commande — &clear
 *   Supprime des messages en masse
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name:        'clear',
  aliases:     ['purge', 'prune', 'delete', 'supprimer'],
  description: 'Supprime un nombre de messages dans le salon.',
  usage:       '<nombre> [@membre]',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    5000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageMessages'],

  async execute(client, message, args, guildData) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply({
        embeds: [errorEmbed('Veuillez spécifier un nombre entre 1 et 100.', null, guildData)],
      });
    }

    const targetUser = message.mentions.users.first();

    // Supprimer le message de commande
    await message.delete().catch(() => {});

    let messages = await message.channel.messages.fetch({ limit: 100 });

    // Filtrer par utilisateur si spécifié
    if (targetUser) {
      messages = messages.filter(m => m.author.id === targetUser.id);
    }

    // Filtrer les messages de moins de 14 jours (limite Discord)
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    messages = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

    // Limiter au nombre demandé
    const toDelete = [...messages.values()].slice(0, amount);

    if (toDelete.length === 0) {
      const reply = await message.channel.send({
        embeds: [errorEmbed('Aucun message à supprimer (messages trop anciens ou aucun message trouvé).', null, guildData)],
      });
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    await message.channel.bulkDelete(toDelete, true);

    const reply = await message.channel.send({
      embeds: [successEmbed(
        `**${toDelete.length}** message(s) supprimé(s)${targetUser ? ` de **${targetUser.tag}**` : ''}.`,
        `${config.emojis.trash} Suppression`, guildData
      )],
    });

    setTimeout(() => reply.delete().catch(() => {}), 5000);
  },
};
