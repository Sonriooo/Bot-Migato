/**
 * ─────────────────────────────────────────────
 *   Handler — Chargement des Interactions
 *   (Boutons, Menus déroulants, Modals)
 * ─────────────────────────────────────────────
 */

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');

/**
 * Charge tous les fichiers d'interactions.
 * @param {Client} client
 */
function loadInteractions(client) {
  const types = [
    { dir: 'buttons',     collection: 'buttons'     },
    { dir: 'selectMenus', collection: 'selectMenus' },
    { dir: 'modals',      collection: 'modals'      },
  ];

  for (const { dir, collection } of types) {
    const dirPath = path.join(__dirname, `../${dir}`);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
    let loaded  = 0;

    for (const file of files) {
      try {
        const filePath = path.join(dirPath, file);
        delete require.cache[require.resolve(filePath)];

        const interaction = require(filePath);

        if (!interaction.customId) {
          console.warn(chalk.yellow(`[${dir.toUpperCase()}] ⚠️  ${file} n'a pas de customId.`));
          continue;
        }

        client[collection].set(interaction.customId, interaction);
        loaded++;
      } catch (error) {
        console.error(chalk.red(`[${dir.toUpperCase()}] ❌ Erreur dans ${file} : ${error.message}`));
      }
    }

    console.log(chalk.cyan(`[${dir.toUpperCase()}] ✅ ${loaded} interaction(s) chargée(s).`));
  }
}

module.exports = { loadInteractions };
