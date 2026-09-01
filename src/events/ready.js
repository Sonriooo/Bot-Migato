/**
 * ─────────────────────────────────────────────
 *   Événement — ready
 *   Déclenché quand le bot est connecté
 * ─────────────────────────────────────────────
 */

const { Events, ActivityType } = require('discord.js');
const chalk  = require('chalk');
const cron   = require('node-cron');
const config = require('../config/config');

// Tâches planifiées
const { checkExpiredSanctions } = require('../utils/sanctionUtils');
const { checkGiveaways }        = require('../utils/giveawayUtils');
const { checkReminders }        = require('../utils/reminderUtils');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(chalk.bold.green(`\n[READY] ✅ Connecté en tant que ${client.user.tag}`));
    console.log(chalk.green(`[READY] 📊 Serveurs : ${client.guilds.cache.size}`));
    console.log(chalk.green(`[READY] 👥 Membres  : ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`));
    console.log(chalk.green(`[READY] 📝 Commandes: ${client.commands.size}\n`));

    // Définir la présence du bot
    setPresence(client);

    // Rotation de la présence toutes les 30 secondes
    setInterval(() => setPresence(client), 30000);

    // ── Tâches planifiées ──────────────────────
    // Vérifier les sanctions expirées toutes les minutes
    cron.schedule('* * * * *', async () => {
      await checkExpiredSanctions(client).catch(() => {});
    });

    // Vérifier les giveaways toutes les 10 secondes
    cron.schedule('*/10 * * * * *', async () => {
      await checkGiveaways(client).catch(() => {});
    });

    // Vérifier les rappels toutes les minutes
    cron.schedule('* * * * *', async () => {
      await checkReminders(client).catch(() => {});
    });
  },
};

let presenceIndex = 0;

function setPresence(client) {
  const presences = [
    { type: ActivityType.Watching,  name: `${client.guilds.cache.size} serveurs` },
    { type: ActivityType.Listening, name: `${config.prefix}help` },
    { type: ActivityType.Playing,   name: `${config.botName} Premium` },
    { type: ActivityType.Watching,  name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} membres` },
  ];

  const presence = presences[presenceIndex % presences.length];
  presenceIndex++;

  client.user.setPresence({
    status: 'online',
    activities: [{ name: presence.name, type: presence.type }],
  });
}
