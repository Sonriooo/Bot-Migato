/**
 * ─────────────────────────────────────────────
 *   Connexion à MongoDB via Mongoose
 * ─────────────────────────────────────────────
 */

const mongoose = require('mongoose');
const config   = require('../config/config');
const chalk    = require('chalk');

/**
 * Établit la connexion à MongoDB.
 * Reconnexion automatique en cas d'erreur.
 */
async function connectDatabase() {
  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(chalk.green('[DATABASE] ✅ Connecté à MongoDB avec succès.'));

    // Événements de connexion
    mongoose.connection.on('disconnected', () => {
      console.log(chalk.yellow('[DATABASE] ⚠️  Déconnecté de MongoDB. Tentative de reconnexion...'));
    });

    mongoose.connection.on('reconnected', () => {
      console.log(chalk.green('[DATABASE] ✅ Reconnecté à MongoDB.'));
    });

    mongoose.connection.on('error', (err) => {
      console.error(chalk.red(`[DATABASE] ❌ Erreur MongoDB : ${err.message}`));
    });

  } catch (error) {
    console.warn(chalk.yellow(`[DATABASE] ⚠️ MongoDB indisponible : ${error.message}`));
    console.warn(chalk.yellow('[DATABASE] ⚠️ Le bot continue sans base de données pour le moment.'));
    return false;
  }
}

module.exports = connectDatabase;
