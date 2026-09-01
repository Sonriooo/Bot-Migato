/**
 * ─────────────────────────────────────────────
 *   Configuration Centrale du Bot
 * ─────────────────────────────────────────────
 */

require('dotenv').config();

const primaryOwnerId = process.env.OWNER_ID || '935577727497535499';

module.exports = {
  // ── Identifiants ──────────────────────────
  token: process.env.DISCORD_TOKEN,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-bot',
  ownerId: primaryOwnerId,
  botOwner: primaryOwnerId,
  ownerIds: [primaryOwnerId],

  // ── Préfixe ───────────────────────────────
  prefix: process.env.DEFAULT_PREFIX || '&',

  // ── Design ────────────────────────────────
  colors: {
    main:    process.env.MAIN_COLOR || '#5865F2',
    success: '#57F287',
    error:   '#ED4245',
    warning: '#FEE75C',
    info:    '#5865F2',
    premium: '#FFD700',
    dark:    '#2B2D31',
  },

  // ── Emojis ────────────────────────────────
  emojis: {
    success:  '✅',
    error:    '❌',
    warning:  '⚠️',
    info:     'ℹ️',
    loading:  '⏳',
    premium:  '👑',
    shield:   '🛡️',
    ban:      '🔨',
    kick:     '👢',
    mute:     '🔇',
    warn:     '⚠️',
    lock:     '🔒',
    unlock:   '🔓',
    ticket:   '🎫',
    giveaway: '🎉',
    raid:     '🚨',
    log:      '📋',
    settings: '⚙️',
    stats:    '📊',
    time:     '⏰',
    user:     '👤',
    role:     '🏷️',
    channel:  '📢',
    server:   '🏠',
    ping:     '🏓',
    calc:     '🔢',
    reminder: '⏰',
    snipe:    '🎯',
    poll:     '📊',
    backup:   '💾',
    bot:      '🤖',
    arrow:    '➜',
    dot:      '•',
    star:     '⭐',
    crown:    '👑',
    sword:    '⚔️',
    invite:   '📨',
    link:     '🔗',
    music:    '🎵',
    eye:      '👁️',
    trash:    '🗑️',
    edit:     '✏️',
    add:      '➕',
    remove:   '➖',
    search:   '🔍',
    list:     '📝',
    next:     '▶️',
    prev:     '◀️',
    first:    '⏮️',
    last:     '⏭️',
  },

  // ── Liens ─────────────────────────────────
  links: {
    support: process.env.SUPPORT_LINK || 'https://discord.gg/thWKDwRPA3',
    invite:  process.env.INVITE_LINK  || 'https://discord.com/oauth2/authorize',
  },
  supportServer: process.env.SUPPORT_LINK || 'https://discord.gg/thWKDwRPA3',

  // ── Paramètres ────────────────────────────
  botName: process.env.BOT_NAME || 'PremiumBot',

  // ── Cooldowns (ms) ────────────────────────
  cooldowns: {
    default:    3000,
    moderation: 2000,
    owner:      1000,
    buyer:      1000,
  },

  // ── Limites anti-spam ─────────────────────
  antiSpam: {
    maxMessages:  5,
    interval:     5000,
    punishment:   'mute',
    muteDuration: 300000, // 5 minutes
  },

  // ── Antiraid ──────────────────────────────
  antiraid: {
    joinThreshold:    10,   // joins en X ms
    joinInterval:     10000,
    channelThreshold: 5,
    roleThreshold:    5,
    banThreshold:     3,
    kickThreshold:    3,
  },

  // ── Niveaux de permissions ─────────────────
  permLevels: {
    Perm1: 1,
    Perm2: 2,
    Perm3: 3,
    Perm4: 4,
    Perm5: 5,
    Perm6: 6,
    Perm7: 7,
    Perm8: 8,
    Perm9: 9,
    Sys:   10,
    Owner: 11,
  },
};
