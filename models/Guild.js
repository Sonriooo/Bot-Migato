/**
 * ─────────────────────────────────────────────
 *   Modèle MongoDB — Configuration Serveur
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },

  // ── Préfixe ───────────────────────────────
  prefix: { type: String, default: '&' },

  // ── Thème / couleur ───────────────────────
  color: { type: String, default: '#5865F2' },

  // ── Rôle mute ─────────────────────────────
  muteRole: { type: String, default: null },

  // ── Salon logs ────────────────────────────
  logs: {
    modlogs:   { type: String, default: null },
    msglogs:   { type: String, default: null },
    joinlogs:  { type: String, default: null },
    leavelogs: { type: String, default: null },
    raidlogs:  { type: String, default: null },
    rolelogs:  { type: String, default: null },
    voicelogs: { type: String, default: null },
    general:   { type: String, default: null },
  },

  // ── Messages join/leave ───────────────────
  joinMessage: {
    enabled:   { type: Boolean, default: false },
    channelId: { type: String,  default: null },
    message:   { type: String,  default: 'Bienvenue {user} sur **{server}** ! 🎉' },
    embed:     { type: Boolean, default: true },
  },
  leaveMessage: {
    enabled:   { type: Boolean, default: false },
    channelId: { type: String,  default: null },
    message:   { type: String,  default: '{user} a quitté **{server}**. 👋' },
    embed:     { type: Boolean, default: true },
  },

  // ── Antiraid ──────────────────────────────
  antiraid: {
    enabled:       { type: Boolean, default: false },
    punishment:    { type: String,  default: 'ban', enum: ['ban', 'kick', 'timeout', 'derank'] },
    antiban:       { type: Boolean, default: false },
    antibot:       { type: Boolean, default: false },
    antichannel:   { type: Boolean, default: false },
    antideco:      { type: Boolean, default: false },
    antieveryone:  { type: Boolean, default: false },
    antijoin:      { type: Boolean, default: false },
    antilink:      { type: Boolean, default: false },
    antirole:      { type: Boolean, default: false },
    antiupdate:    { type: Boolean, default: false },
    antiwebhook:   { type: Boolean, default: false },
    joinThreshold: { type: Number,  default: 10 },
    joinInterval:  { type: Number,  default: 10000 },
    createLimit:   { type: Number,  default: 5 },
    whitelist:     [{ type: String }],
    bypass:        [{ type: String }],
    raidMode:      { type: Boolean, default: false },
  },

  // ── Tickets ───────────────────────────────
  ticket: {
    enabled:      { type: Boolean, default: false },
    categoryId:   { type: String,  default: null },
    logChannelId: { type: String,  default: null },
    supportRoles: [{ type: String }],
    message:      { type: String,  default: 'Cliquez sur le bouton ci-dessous pour ouvrir un ticket.' },
    counter:      { type: Number,  default: 0 },
  },

  // ── Permissions ───────────────────────────
  permissions: {
    Perm1: [{ type: String }],
    Perm2: [{ type: String }],
    Perm3: [{ type: String }],
    Perm4: [{ type: String }],
    Perm5: [{ type: String }],
    Perm6: [{ type: String }],
    Perm7: [{ type: String }],
    Perm8: [{ type: String }],
    Perm9: [{ type: String }],
    Sys:   [{ type: String }],
  },

  // ── Compteurs ─────────────────────────────
  counters: [{
    channelId: String,
    type:      String, // members, bots, channels, roles
    format:    String,
  }],

  // ── Vocal temporaire ──────────────────────
  tempVoc: {
    enabled:   { type: Boolean, default: false },
    channelId: { type: String,  default: null },
    categoryId:{ type: String,  default: null },
  },

  // ── Snipe ─────────────────────────────────
  snipe: {
    enabled: { type: Boolean, default: true },
  },

}, { timestamps: true });

module.exports = mongoose.model('Guild', guildSchema);
