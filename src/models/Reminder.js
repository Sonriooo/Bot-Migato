/**
 * ─────────────────────────────────────────────
 *   Modèle MongoDB — Rappels (Reminders)
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  channelId: { type: String, required: true },
  guildId:   { type: String, required: true },
  message:   { type: String, required: true },
  remindAt:  { type: Date,   required: true },
  sent:      { type: Boolean, default: false },
}, { timestamps: true });

reminderSchema.index({ remindAt: 1, sent: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
