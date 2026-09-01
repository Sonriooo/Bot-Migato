/**
 * ─────────────────────────────────────────────
 *   Modèle MongoDB — Tickets
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId:    { type: String, required: true },
  guildId:     { type: String, required: true },
  channelId:   { type: String, required: true },
  userId:      { type: String, required: true },

  subject:     { type: String, default: 'Support' },
  status:      { type: String, default: 'open', enum: ['open', 'closed', 'deleted'] },

  claimedBy:   { type: String, default: null },
  closedBy:    { type: String, default: null },
  closedAt:    { type: Date,   default: null },

  // Transcript HTML
  transcript:  { type: String, default: null },

  // Messages pour le transcript
  messages: [{
    authorId:   String,
    authorTag:  String,
    content:    String,
    timestamp:  Date,
    attachments:[String],
  }],

}, { timestamps: true });

ticketSchema.index({ guildId: 1, userId: 1 });
ticketSchema.index({ guildId: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
