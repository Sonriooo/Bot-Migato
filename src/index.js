/**
 * ╔══════════════════════════════════════════════╗
 * ║         BOT DISCORD PREMIUM — v1.0.0         ║
 * ║         Développé avec discord.js v14         ║
 * ╚══════════════════════════════════════════════╝
 */

require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require('discord.js');

const chalk          = require('chalk');
const config         = require('./config/config');
const connectDatabase = require('./database/connect');
const { loadCommands }     = require('./handlers/commandHandler');
const { loadEvents }       = require('./handlers/eventHandler');
const { loadInteractions } = require('./handlers/interactionHandler');

// ── Création du client Discord ─────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: false,
  },
});

// ── Collections ────────────────────────────────
client.commands    = new Collection(); // Commandes
client.aliases     = new Collection(); // Alias
client.cooldowns   = new Collection(); // Cooldowns
client.buttons     = new Collection(); // Boutons
client.selectMenus = new Collection(); // Menus déroulants
client.modals      = new Collection(); // Modals
client.snipes      = new Map();        // Messages supprimés (snipe)
client.editSnipes  = new Map();        // Messages édités (editsnipe)
client.antiraid    = new Map();        // Données antiraid en temps réel

// ── Démarrage ──────────────────────────────────
(async () => {
  console.log(chalk.bold.blue('\n╔══════════════════════════════════════════════╗'));
  console.log(chalk.bold.blue('║         BOT DISCORD PREMIUM — v1.0.0         ║'));
  console.log(chalk.bold.blue('╚══════════════════════════════════════════════╝\n'));

  // 1. Connexion à MongoDB
  connectDatabase().catch(() => {});

  // 2. Chargement des commandes
  loadCommands(client);

  // 3. Chargement des événements
  loadEvents(client);

  // 4. Chargement des interactions
  loadInteractions(client);

  // 5. Connexion à Discord
  await client.login(config.token);

})();

// ── Gestion globale des erreurs ────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('[ERROR] ❌ Promesse rejetée non gérée :'), reason);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('[ERROR] ❌ Exception non capturée :'), error);
});

process.on('uncaughtExceptionMonitor', (error) => {
  console.error(chalk.red('[ERROR] ❌ Exception non capturée (monitor) :'), error);
});

module.exports = client;
