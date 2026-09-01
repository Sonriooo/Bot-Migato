/**
 * ─────────────────────────────────────────────
 *   Handler — Chargement des Commandes
 * ─────────────────────────────────────────────
 */

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');

/**
 * Charge toutes les commandes depuis le dossier src/commands.
 * @param {Client} client
 */
function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  const categories   = fs.readdirSync(commandsPath);
  const seenCommands = new Set();

  let loaded = 0;
  let errors = 0;

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const stat = fs.statSync(categoryPath);
    if (!stat.isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      try {
        const filePath = path.join(categoryPath, file);

        // Supprimer le cache pour permettre le rechargement
        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        if (!command.name) {
          console.warn(chalk.yellow(`[COMMANDS] ⚠️  ${file} n'a pas de nom défini.`));
          errors++;
          continue;
        }

        if (seenCommands.has(command.name) || client.commands.has(command.name)) {
          console.warn(chalk.yellow(`[COMMANDS] ⚠️  Commande en double ignorée : ${command.name}`));
          continue;
        }

        // Ajouter la catégorie automatiquement
        command.category = category;
        seenCommands.add(command.name);

        // Enregistrer la commande principale
        client.commands.set(command.name, command);

        // Enregistrer les alias
        if (command.aliases && Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            if (!client.aliases.has(alias)) {
              client.aliases.set(alias, command.name);
            }
          }
        }

        loaded++;
      } catch (error) {
        console.error(chalk.red(`[COMMANDS] ❌ Erreur lors du chargement de ${file} : ${error.message}`));
        errors++;
      }
    }
  }

  console.log(chalk.cyan(`[COMMANDS] ✅ ${loaded} commande(s) chargée(s) | ${errors} erreur(s).`));
}

module.exports = { loadCommands };
