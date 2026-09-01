/**
 * ─────────────────────────────────────────────
 *   Modèle MongoDB — Giveaways
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  messageId:   { type: String, required: true, unique: true },
  channelId:   { type: String, required: true },
  guildId:     { type: String, required: true },
  hostId:      { type: String, required: true },

  prize:       { type: String, required: true },
  description: { type: String, default: null },
  winnerCount: { type: Number, default: 1 },

  endsAt:      { type: Date, required: true },
  ended:       { type: Boolean, default: false },
  winners:     [{ type: String }],
  entries:     [{ type: String }], // userId[]

  // Conditions de participation
  requirements: {
    roles:       [{ type: String }], // rôles requis
    invites:     { type: Number, default: 0 },
    messages:    { type: Number, default: 0 },
  },

  // Blacklist de participants
  blacklist:   [{ type: String }],

  // Données embed
  embedColor:  { type: String, default: '#5865F2' },

}, { timestamps: true });

giveawaySchema.index({ guildId: 1, ended: 1 });
giveawaySchema.index({ endsAt: 1 });

module.exports = mongoose.model('Giveaway', giveawaySchema);
