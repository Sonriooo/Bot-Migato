/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Gestion des Rappels
 * ─────────────────────────────────────────────
 */

const Reminder = require('../models/Reminder');
const { createEmbed } = require('./embed');
const config = require('../config/config');

/**
 * Vérifie et envoie les rappels dus.
 * @param {Client} client
 */
async function checkReminders(client) {
  const now     = new Date();
  const pending = await Reminder.find({ sent: false, remindAt: { $lte: now } });

  for (const reminder of pending) {
    try {
      const channel = client.channels.cache.get(reminder.channelId);
      if (!channel) {
        // Essayer en DM
        const user = await client.users.fetch(reminder.userId).catch(() => null);
        if (user) {
          const embed = createEmbed({
            color:       config.colors.info,
            title:       `${config.emojis.reminder} Rappel !`,
            description: reminder.message,
          });
          await user.send({ embeds: [embed] }).catch(() => {});
        }
      } else {
        const embed = createEmbed({
          color:       config.colors.info,
          title:       `${config.emojis.reminder} Rappel !`,
          description: `<@${reminder.userId}>, voici votre rappel :\n\n${reminder.message}`,
        });
        await channel.send({ embeds: [embed] }).catch(() => {});
      }

      await Reminder.findByIdAndUpdate(reminder._id, { sent: true });
    } catch (error) {
      console.error(`[REMINDER] Erreur rappel :`, error.message);
    }
  }
}

module.exports = { checkReminders };
