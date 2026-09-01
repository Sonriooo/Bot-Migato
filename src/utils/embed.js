/**
 * ─────────────────────────────────────────────
 *   Utilitaire — Embeds Premium
 * ─────────────────────────────────────────────
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

/**
 * Crée un embed de base avec le style premium du bot.
 * @param {object} options
 * @param {string} [options.color] - Couleur de l'embed
 * @param {string} [options.title] - Titre
 * @param {string} [options.description] - Description
 * @param {string} [options.thumbnail] - URL thumbnail
 * @param {string} [options.image] - URL image
 * @param {object} [options.author] - { name, iconURL, url }
 * @param {object} [options.footer] - { text, iconURL }
 * @param {Array}  [options.fields] - [{ name, value, inline }]
 * @param {boolean}[options.timestamp] - Ajouter timestamp
 * @param {object} [options.guild] - Données du serveur (pour couleur personnalisée)
 * @returns {EmbedBuilder}
 */
function createEmbed(options = {}) {
  const {
    color,
    title,
    description,
    thumbnail,
    image,
    author,
    footer,
    fields = [],
    timestamp = true,
    guild = null,
  } = options;

  // Couleur : priorité guild > option > config
  const embedColor = color
    || (guild?.color)
    || config.colors.main;

  const embed = new EmbedBuilder().setColor(embedColor);

  if (title)       embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (thumbnail)   embed.setThumbnail(thumbnail);
  if (image)       embed.setImage(image);
  if (timestamp)   embed.setTimestamp();

  if (author) {
    embed.setAuthor({
      name:    author.name    || config.botName,
      iconURL: author.iconURL || null,
      url:     author.url     || null,
    });
  }

  if (footer) {
    embed.setFooter({
      text:    footer.text    || `${config.botName} • Premium`,
      iconURL: footer.iconURL || null,
    });
  } else {
    embed.setFooter({ text: `${config.botName} • Premium` });
  }

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

/**
 * Embed de succès.
 */
function successEmbed(description, title = null, guild = null) {
  return createEmbed({
    color: config.colors.success,
    title: title || `${config.emojis.success} Succès`,
    description,
    guild,
  });
}

/**
 * Embed d'erreur.
 */
function errorEmbed(description, title = null, guild = null) {
  return createEmbed({
    color: config.colors.error,
    title: title || `${config.emojis.error} Erreur`,
    description,
    guild,
  });
}

/**
 * Embed d'avertissement.
 */
function warnEmbed(description, title = null, guild = null) {
  return createEmbed({
    color: config.colors.warning,
    title: title || `${config.emojis.warning} Avertissement`,
    description,
    guild,
  });
}

/**
 * Embed d'information.
 */
function infoEmbed(description, title = null, guild = null) {
  return createEmbed({
    color: config.colors.info,
    title: title || `${config.emojis.info} Information`,
    description,
    guild,
  });
}

/**
 * Embed de chargement.
 */
function loadingEmbed(description = 'Chargement en cours...', guild = null) {
  return createEmbed({
    color: config.colors.info,
    title: `${config.emojis.loading} Chargement`,
    description,
    guild,
    timestamp: false,
  });
}

/**
 * Embed de log de modération.
 */
function modlogEmbed(options = {}) {
  const {
    type,
    user,
    moderator,
    reason,
    duration,
    sanctionId,
    guild = null,
  } = options;

  const typeColors = {
    ban:      config.colors.error,
    tempban:  config.colors.error,
    kick:     '#FF7043',
    mute:     '#FF9800',
    tempmute: '#FF9800',
    warn:     config.colors.warning,
    unmute:   config.colors.success,
    unban:    config.colors.success,
    derank:   '#9C27B0',
  };

  const typeEmojis = {
    ban:      config.emojis.ban,
    tempban:  config.emojis.ban,
    kick:     config.emojis.kick,
    mute:     config.emojis.mute,
    tempmute: config.emojis.mute,
    warn:     config.emojis.warn,
    unmute:   config.emojis.success,
    unban:    config.emojis.success,
    derank:   config.emojis.remove,
  };

  const typeLabels = {
    ban:      'Bannissement',
    tempban:  'Bannissement Temporaire',
    kick:     'Expulsion',
    mute:     'Mute',
    tempmute: 'Mute Temporaire',
    warn:     'Avertissement',
    unmute:   'Unmute',
    unban:    'Unban',
    derank:   'Suppression de Rôles',
  };

  const embed = createEmbed({
    color: typeColors[type] || config.colors.main,
    title: `${typeEmojis[type] || ''} ${typeLabels[type] || type}`,
    guild,
    fields: [
      { name: `${config.emojis.user} Membre`, value: `${user} (\`${user?.id || user}\`)`, inline: true },
      { name: `${config.emojis.shield} Modérateur`, value: `${moderator}`, inline: true },
      { name: `${config.emojis.dot} Raison`, value: reason || 'Aucune raison fournie.', inline: false },
      ...(duration ? [{ name: `${config.emojis.time} Durée`, value: duration, inline: true }] : []),
      ...(sanctionId ? [{ name: `${config.emojis.list} ID Sanction`, value: `\`${sanctionId}\``, inline: true }] : []),
    ],
  });

  if (user?.displayAvatarURL) {
    embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
  }

  return embed;
}

module.exports = {
  createEmbed,
  successEmbed,
  errorEmbed,
  warnEmbed,
  infoEmbed,
  loadingEmbed,
  modlogEmbed,
};
