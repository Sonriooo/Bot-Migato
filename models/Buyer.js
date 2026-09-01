/**
 * ─────────────────────────────────────────────
 *   Modèle MongoDB — Acheteurs (Buyers)
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  userId:    { type: String, required: true, unique: true },

  // Whitelist / Blacklist
  whitelist: [{ type: String }], // guildIds autorisés
  blacklist: [{ type: String }], // userIds bannis

  // Thème embed
  theme: {
    color:  { type: String, default: '#5865F2' },
    footer: { type: String, default: null },
    banner: { type: String, default: null },
  },

  // Préfixe personnalisé
  prefix: { type: String, default: '&' },

  // Paramètres de présence
  presence: {
    status:      { type: String, default: 'online', enum: ['online', 'idle', 'dnd', 'invisible'] },
    activityType:{ type: String, default: null },
    activityName:{ type: String, default: null },
    activityUrl: { type: String, default: null },
  },

  // Serveurs où le bot est actif
  guilds: [{ type: String }],

  // Actif ou non
  active: { type: Boolean, default: true },

  // Blocage global du bot
  banned: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Buyer', buyerSchema);
