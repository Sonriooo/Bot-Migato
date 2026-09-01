/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Gestion des Giveaways
 * ─────────────────────────────────────────────
 */

const Giveaway = require('../models/Giveaway');
const { createEmbed } = require('./embed');
const config = require('../config/config');
const { discordTimestamp } = require('./format');

/**
 * Vérifie les giveaways terminés et désigne les gagnants.
 * @param {Client} client
 */
async function checkGiveaways(client) {
  const now    = new Date();
  const active = await Giveaway.find({ ended: false, endsAt: { $lte: now } });

  for (const giveaway of active) {
    try {
      await endGiveaway(client, giveaway);
    } catch (error) {
      console.error(`[GIVEAWAY] Erreur fin giveaway ${giveaway.messageId} :`, error.message);
    }
  }
}

/**
 * Termine un giveaway et désigne les gagnants.
 * @param {Client} client
 * @param {GiveawayDoc} giveaway
 */
async function endGiveaway(client, giveaway) {
  const guild   = client.guilds.cache.get(giveaway.guildId);
  if (!guild) return;

  const channel = guild.channels.cache.get(giveaway.channelId);
  if (!channel) return;

  const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);

  // Filtrer les participants éligibles
  let eligible = [...giveaway.entries].filter(id => !giveaway.blacklist.includes(id));

  // Vérifier les rôles requis
  if (giveaway.requirements.roles.length > 0) {
    eligible = eligible.filter(userId => {
      const member = guild.members.cache.get(userId);
      if (!member) return false;
      return giveaway.requirements.roles.every(roleId => member.roles.cache.has(roleId));
    });
  }

  // Sélectionner les gagnants
  const winners = [];
  const pool    = [...eligible];

  for (let i = 0; i < giveaway.winnerCount && pool.length > 0; i++) {
    const index  = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }

  // Mettre à jour la base de données
  await Giveaway.findByIdAndUpdate(giveaway._id, {
    ended:   true,
    winners: winners,
  });

  // Construire l'embed de fin
  const winnerMentions = winners.length > 0
    ? winners.map(id => `<@${id}>`).join(', ')
    : 'Aucun gagnant (pas assez de participants éligibles)';

  const embed = createEmbed({
    color:       '#FFD700',
    title:       `${config.emojis.giveaway} Giveaway Terminé !`,
    description: `**Prix :** ${giveaway.prize}\n\n🏆 **Gagnant(s) :** ${winnerMentions}`,
    fields: [
      { name: `${config.emojis.user} Participants`, value: `${eligible.length}`, inline: true },
      { name: `${config.emojis.crown} Gagnants`,    value: `${winners.length}`, inline: true },
      { name: `${config.emojis.time} Terminé`,      value: discordTimestamp(new Date()), inline: true },
    ],
  });

  if (message) {
    await message.edit({ embeds: [embed], components: [] }).catch(() => {});
  }

  // Annoncer les gagnants
  if (winners.length > 0) {
    await channel.send({
      content: `🎉 Félicitations ${winnerMentions} ! Vous avez gagné **${giveaway.prize}** !`,
      embeds:  [embed],
    }).catch(() => {});
  } else {
    await channel.send({
      embeds: [embed],
    }).catch(() => {});
  }
}

/**
 * Construit l'embed d'un giveaway actif.
 * @param {GiveawayDoc} giveaway
 * @returns {EmbedBuilder}
 */
function buildGiveawayEmbed(giveaway) {
  const requirements = [];
  if (giveaway.requirements.roles.length > 0) {
    requirements.push(`${config.emojis.role} Rôles requis : ${giveaway.requirements.roles.map(r => `<@&${r}>`).join(', ')}`);
  }
  if (giveaway.requirements.invites > 0) {
    requirements.push(`${config.emojis.invite} Invitations requises : ${giveaway.requirements.invites}`);
  }
  if (giveaway.requirements.messages > 0) {
    requirements.push(`${config.emojis.list} Messages requis : ${giveaway.requirements.messages}`);
  }

  return createEmbed({
    color:       '#FFD700',
    title:       `${config.emojis.giveaway} GIVEAWAY`,
    description: `**Prix :** ${giveaway.prize}\n${giveaway.description ? `\n${giveaway.description}\n` : ''}`,
    fields: [
      { name: `${config.emojis.time} Fin`,         value: discordTimestamp(giveaway.endsAt), inline: true },
      { name: `${config.emojis.crown} Gagnants`,   value: `${giveaway.winnerCount}`, inline: true },
      { name: `${config.emojis.user} Participants`,value: `${giveaway.entries.length}`, inline: true },
      ...(requirements.length > 0 ? [{ name: `${config.emojis.shield} Conditions`, value: requirements.join('\n'), inline: false }] : []),
    ],
    footer: { text: `Organisé par le serveur • Cliquez 🎉 pour participer` },
  });
}

module.exports = { checkGiveaways, endGiveaway, buildGiveawayEmbed };
