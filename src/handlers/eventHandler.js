/**
 * ─────────────────────────────────────────────
 *   Handler — Chargement des Événements
 * ─────────────────────────────────────────────
 */

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');

/**
 * Charge tous les événements depuis le dossier src/events.
 * @param {Client} client
 */
function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const files      = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  let loaded = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filePath = path.join(eventsPath, file);
      delete require.cache[require.resolve(filePath)];

      const event = require(filePath);

      if (!event.name) {
        console.warn(chalk.yellow(`[EVENTS] ⚠️  ${file} n'a pas de nom d'événement.`));
        errors++;
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
      }

      loaded++;
    } catch (error) {
      console.error(chalk.red(`[EVENTS] ❌ Erreur lors du chargement de ${file} : ${error.message}`));
      errors++;
    }
  }

  console.log(chalk.cyan(`[EVENTS] ✅ ${loaded} événement(s) chargé(s) | ${errors} erreur(s).`));
}

module.exports = { loadEvents };
