/**
 * ─────────────────────────────────────────────
 *   Commande — &calc
 *   Calculatrice sécurisée
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name:        'calc',
  aliases:     ['calculate', 'math', 'calcul'],
  description: 'Effectue un calcul mathématique.',
  usage:       '<expression>',
  category:    'Public',
  permLevel:   0,
  cooldown:    2000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const color      = guildData?.color || config.colors.main;
    const expression = args.join(' ');

    // Sécuriser l'expression (autoriser uniquement les caractères mathématiques)
    const sanitized = expression.replace(/[^0-9+\-*/().%\s^]/g, '');

    if (!sanitized.trim()) {
      return message.reply({
        embeds: [errorEmbed('Expression invalide. Utilisez uniquement des chiffres et opérateurs (+, -, *, /, %, ^).', null, guildData)],
      });
    }

    let result;
    try {
      // Remplacer ^ par ** pour la puissance
      const safe = sanitized.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      result = Function('"use strict"; return (' + safe + ')')();

      if (!isFinite(result)) throw new Error('Résultat infini ou invalide');
    } catch {
      return message.reply({
        embeds: [errorEmbed('Impossible d\'évaluer cette expression.', null, guildData)],
      });
    }

    const embed = createEmbed({
      color,
      title:       `${config.emojis.calc} Calculatrice`,
      description: `**Expression :** \`${expression}\`\n**Résultat :** \`${result}\``,
      guild:       guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
