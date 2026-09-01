/**
 * ─────────────────────────────────────────────
 *   Commande — &sanction-info
 *   Affiche les détails d'une sanction par ID
 * ─────────────────────────────────────────────
 */

const config   = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { discordTimestamp, formatDuration } = require('../../utils/format');
const Sanction = require('../../models/Sanction');

module.exports = {
  name:        'sanction-info',
  aliases:     ['sanctioninfo', 'sinfo'],
  description: 'Affiche les détails d\'une sanction par son ID.',
  usage:       '<ID>',
  category:    'Moderation',
  permLevel:   3,
  cooldown:    3000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const color      = guildData?.color || config.colors.main;
    const sanctionId = args[0].startsWith('#') ? args[0] : `#${args[0]}`;

    const sanction = await Sanction.findOne({
      guildId:    message.guild.id,
      sanctionId,
    });

    if (!sanction) {
      return message.reply({ embeds: [errorEmbed(`Sanction \`${sanctionId}\` introuvable.`, null, guildData)] });
    }

    const user = await client.users.fetch(sanction.userId).catch(() => null);
    const mod  = await client.users.fetch(sanction.moderatorId).catch(() => null);

    const embed = createEmbed({
      color,
      title:       `${config.emojis.shield} Sanction ${sanction.sanctionId}`,
      thumbnail:   user?.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: `${config.emojis.user} Membre`,       value: user ? `${user.tag} (\`${user.id}\`)` : `\`${sanction.userId}\``, inline: true },
        { name: `${config.emojis.shield} Modérateur`, value: mod ? `${mod.tag}` : `\`${sanction.moderatorId}\``, inline: true },
        { name: `${config.emojis.dot} Type`,          value: sanction.type.toUpperCase(), inline: true },
        { name: `${config.emojis.list} Raison`,       value: sanction.reason, inline: false },
        { name: `${config.emojis.time} Date`,         value: discordTimestamp(sanction.createdAt), inline: true },
        { name: `${config.emojis.dot} Actif`,         value: sanction.active ? '✅ Oui' : '❌ Non', inline: true },
        ...(sanction.duration ? [{ name: `${config.emojis.time} Durée`, value: formatDuration(sanction.duration), inline: true }] : []),
        ...(sanction.expiresAt ? [{ name: `${config.emojis.time} Expire`, value: discordTimestamp(sanction.expiresAt), inline: true }] : []),
      ],
      guild: guildData,
    });

    await message.reply({ embeds: [embed] });
  },
};
