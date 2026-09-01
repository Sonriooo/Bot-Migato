/**
 * ─────────────────────────────────────────────
 *   Événement — messageCreate
 *   Traitement des commandes avec préfixe
 * ─────────────────────────────────────────────
 */

const { Events } = require('discord.js');
const config     = require('../config/config');
const { getGuildData, isBuyer, isBlacklisted } = require('../utils/guildUtils');
const { getPermLevel } = require('../utils/permissions');
const { errorEmbed }   = require('../utils/embed');
const { createSanction } = require('../utils/sanctionUtils');

// Cache des cooldowns
const cooldowns = new Map();
// Cache anti-spam
const spamCache = new Map();

module.exports = {
  name: Events.MessageCreate,

  async execute(client, message) {
    // Ignorer les bots et les DMs
    if (message.author.bot) return;
    if (!message.guild)     return;

    if (await isBlacklisted(message.author.id)) {
      return message.reply({
        embeds: [errorEmbed('Vous avez été blacklisté du bot et ne pouvez plus utiliser ses commandes.', null, null)],
      }).catch(() => {});
    }

    // Récupérer la configuration du serveur
    let guildData;
    try {
      guildData = await getGuildData(message.guild.id);
    } catch {
      guildData = null;
    }

    // ── Protections Antiraid ───────────────────
    if (guildData?.antiraid?.enabled) {
      const ar = guildData.antiraid;

      // Anti-Spam
      if (ar.antispam) {
        const key = `${message.author.id}_${message.guild.id}`;
        const now = Date.now();
        if (!spamCache.has(key)) spamCache.set(key, { messages: [] });
        const data = spamCache.get(key);
        data.messages = data.messages.filter(t => now - t < (ar.spamInterval || 5000));
        data.messages.push(now);
        if (data.messages.length >= (ar.spamThreshold || 5)) {
          await message.delete().catch(() => {});
          const punishment = ar.spamPunishment || 'mute';
          const member = message.guild.members.cache.get(message.author.id);
          if (member && !member.permissions.has('Administrator')) {
            if (punishment === 'mute') await member.timeout(60000, 'Antiraid — Spam').catch(() => {});
            else if (punishment === 'kick') await member.kick('Antiraid — Spam').catch(() => {});
            else if (punishment === 'ban') await member.ban({ reason: 'Antiraid — Spam' }).catch(() => {});
            await createSanction({ guildId: message.guild.id, userId: message.author.id, moderatorId: client.user.id, type: punishment, reason: 'Antiraid — Spam détecté' }).catch(() => {});
          }
          spamCache.delete(key);
          return;
        }
      }

      // Anti-Liens
      if (ar.antilinks) {
        const urlRegex = /https?:\/\/[^\s]+/gi;
        if (urlRegex.test(message.content)) {
          const member = message.guild.members.cache.get(message.author.id);
          if (member && !member.permissions.has('ManageMessages')) {
            await message.delete().catch(() => {});
            return;
          }
        }
      }

      // Anti-Invites
      if (ar.antiinvite) {
        const inviteRegex = /discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[a-zA-Z0-9]+/gi;
        if (inviteRegex.test(message.content)) {
          const member = message.guild.members.cache.get(message.author.id);
          if (member && !member.permissions.has('ManageGuild')) {
            await message.delete().catch(() => {});
            return;
          }
        }
      }

      // Anti-Mentions
      if (ar.antimentions) {
        const mentionCount = (message.mentions.users.size || 0) + (message.mentions.roles.size || 0);
        if (mentionCount >= (ar.mentionThreshold || 5)) {
          await message.delete().catch(() => {});
          const member = message.guild.members.cache.get(message.author.id);
          if (member && !member.permissions.has('Administrator')) {
            await member.timeout(300000, 'Antiraid — Mass mentions').catch(() => {});
            await createSanction({ guildId: message.guild.id, userId: message.author.id, moderatorId: client.user.id, type: 'tempmute', reason: 'Antiraid — Mass mentions', duration: 300000, expiresAt: new Date(Date.now() + 300000) }).catch(() => {});
          }
          return;
        }
      }
    }

    // Déterminer le préfixe
    const prefix = guildData?.prefix || config.prefix;

    // Vérifier si le message commence par le préfixe ou une mention
    const mentionRegex = new RegExp(`^(<@!?${client.user.id}>)\\s*`);
    let usedPrefix = null;

    if (message.content.startsWith(prefix)) {
      usedPrefix = prefix;
    } else if (mentionRegex.test(message.content)) {
      usedPrefix = message.content.match(mentionRegex)[0];
    } else {
      return;
    }

    // Parser la commande et les arguments
    const args        = message.content.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commandName) return;

    // Trouver la commande (ou alias)
    const cmd = client.commands.get(commandName)
      || client.commands.get(client.aliases.get(commandName));

    if (!cmd) return;

    const isOwnerLevel = (await getPermLevel(message.member, guildData)) >= 11;
    const isBuyerLevel = await isBuyer(message.author.id) || message.author.id === config.botOwner;

    // Sécurité des catégories sensibles
    if (cmd.category === 'Owner' && !isOwnerLevel) {
      return message.reply({
        embeds: [errorEmbed('Cette commande est réservée au propriétaire du bot.', null, guildData)],
      }).catch(() => {});
    }

    if (cmd.category === 'Buyer' && !isOwnerLevel && !isBuyerLevel) {
      return message.reply({
        embeds: [errorEmbed('Cette commande est réservée aux acheteurs et au propriétaire du bot.', null, guildData)],
      }).catch(() => {});
    }

    // Vérifier les permissions Discord requises
    if (cmd.userPerms && !message.member.permissions.has(cmd.userPerms)) {
      return message.reply({
        embeds: [errorEmbed(
          `Vous n'avez pas les permissions nécessaires : \`${cmd.userPerms.join(', ')}\``,
          null, guildData
        )],
      }).catch(() => {});
    }

    if (cmd.botPerms && !message.guild.members.me.permissions.has(cmd.botPerms)) {
      return message.reply({
        embeds: [errorEmbed(
          `Je n'ai pas les permissions nécessaires : \`${cmd.botPerms.join(', ')}\``,
          null, guildData
        )],
      }).catch(() => {});
    }

    // Vérifier le niveau de permission requis
    if (cmd.permLevel && cmd.permLevel > 0) {
      const userLevel = await getPermLevel(message.member, guildData);
      if (userLevel < cmd.permLevel) {
        return message.reply({
          embeds: [errorEmbed(
            `Vous n'avez pas le niveau de permission requis pour cette commande.\n` +
            `Requis : **${cmd.permLevel}** | Votre niveau : **${userLevel}**`,
            null, guildData
          )],
        }).catch(() => {});
      }
    }

    // Vérifier le cooldown
    const cooldownKey = `${cmd.name}-${message.author.id}`;
    const cooldownTime = cmd.cooldown || config.cooldowns.default;

    if (cooldowns.has(cooldownKey)) {
      const remaining = cooldowns.get(cooldownKey) - Date.now();
      if (remaining > 0) {
        return message.reply({
          embeds: [errorEmbed(
            `Veuillez patienter **${(remaining / 1000).toFixed(1)}s** avant de réutiliser cette commande.`,
            null, guildData
          )],
        }).catch(() => {});
      }
    }

    cooldowns.set(cooldownKey, Date.now() + cooldownTime);
    setTimeout(() => cooldowns.delete(cooldownKey), cooldownTime);

    // Vérifier les arguments obligatoires
    if (cmd.args && args.length < (cmd.minArgs || 1)) {
      const usage = cmd.usage ? `\`${prefix}${cmd.name} ${cmd.usage}\`` : `\`${prefix}${cmd.name}\``;
      return message.reply({
        embeds: [errorEmbed(
          `Arguments manquants.\n**Utilisation :** ${usage}`,
          null, guildData
        )],
      }).catch(() => {});
    }

    // Exécuter la commande
    try {
      await cmd.execute(client, message, args, guildData);
    } catch (error) {
      console.error(`[CMD ERROR] ${cmd.name} :`, error);
      message.reply({
        embeds: [errorEmbed(
          `Une erreur est survenue lors de l'exécution de cette commande.\n\`\`\`${error.message}\`\`\``,
          null, guildData
        )],
      }).catch(() => {});
    }
  },
};
