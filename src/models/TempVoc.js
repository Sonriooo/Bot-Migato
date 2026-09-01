/**
 * ─────────────────────────────────────────────
 *   Modèle MongoDB — Salons Vocaux Temporaires
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const tempVocSchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true },
  guildId:   { type: String, required: true },
  ownerId:   { type: String, required: true },
  name:      { type: String, required: true },
  limit:     { type: Number, default: 0 },
  locked:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('TempVoc', tempVocSchema);
