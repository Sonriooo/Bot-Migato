/**
 * ─────────────────────────────────────────────
 *   Modèle MongoDB — Sanctions
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const sanctionSchema = new mongoose.Schema({
  // Identifiant unique de sanction (ex: #0001)
  sanctionId: { type: String, required: true, unique: true },

  guildId:    { type: String, required: true },
  userId:     { type: String, required: true },
  moderatorId:{ type: String, required: true },

  type: {
    type: String,
    required: true,
    enum: ['warn', 'mute', 'tempmute', 'unmute', 'kick', 'ban', 'tempban', 'unban', 'derank'],
  },

  reason:    { type: String, default: 'Aucune raison fournie.' },
  duration:  { type: Number, default: null }, // en ms
  expiresAt: { type: Date,   default: null },
  active:    { type: Boolean, default: true },

  // Données supplémentaires (rôles retirés pour derank, etc.)
  extra: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true });

// Index pour les requêtes fréquentes
sanctionSchema.index({ guildId: 1, userId: 1 });
sanctionSchema.index({ guildId: 1, type: 1 });
sanctionSchema.index({ expiresAt: 1 }, { sparse: true });

module.exports = mongoose.model('Sanction', sanctionSchema);
