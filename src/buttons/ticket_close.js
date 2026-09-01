/**
 * ─────────────────────────────────────────────
 *   Bouton — ticket_close
 *   Ferme un ticket et génère le transcript
 * ─────────────────────────────────────────────
 */

const config  = require('../config/config');
const { createEmbed, errorEmbed } = require('../utils/embed');
const { sendLog } = require('../utils/guildUtils');
const Ticket  = require('../models/Ticket');

module.exports = {
  customId: 'ticket_close',

  async execute(client, interaction, guildData) {
    await interaction.deferReply({ ephemeral: true });

    const ticket = await Ticket.findOne({
      channelId: interaction.channel.id,
      status:    'open',
    });

    if (!ticket) {
      return interaction.editReply({ embeds: [errorEmbed('Ce salon n\'est pas un ticket ouvert.', null, guildData)] });
    }

    // Générer le transcript HTML
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const transcript = generateTranscript(messages, ticket, interaction.guild);

    // Mettre à jour le ticket
    await Ticket.findByIdAndUpdate(ticket._id, {
      status:     'closed',
      closedBy:   interaction.user.id,
      closedAt:   new Date(),
      transcript,
    });

    // Log
    const logEmbed = createEmbed({
      color:       config.colors.warning,
      title:       `${config.emojis.ticket} Ticket Fermé`,
      description: `Le ticket \`${ticket.ticketId}\` a été fermé.`,
      fields: [
        { name: `${config.emojis.user} Créé par`,  value: `<@${ticket.userId}>`, inline: true },
        { name: `${config.emojis.shield} Fermé par`,value: `${interaction.user}`, inline: true },
        { name: `${config.emojis.list} ID`,         value: `\`${ticket.ticketId}\``, inline: true },
      ],
      guild: guildData,
    });

    await sendLog(interaction.guild, 'modlogs', logEmbed, guildData);

    await interaction.editReply({
      embeds: [createEmbed({
        color:       config.colors.success,
        title:       `${config.emojis.success} Ticket Fermé`,
        description: 'Le ticket a été fermé. Ce salon sera supprimé dans 5 secondes.',
        guild:       guildData,
      })],
    });

    setTimeout(async () => {
      await interaction.channel.delete('Ticket fermé').catch(() => {});
      await Ticket.findByIdAndUpdate(ticket._id, { status: 'deleted' });
    }, 5000);
  },
};

/**
 * Génère un transcript HTML simple.
 */
function generateTranscript(messages, ticket, guild) {
  const msgs = [...messages.values()].reverse();

  const rows = msgs.map(m => `
    <div class="message">
      <img class="avatar" src="${m.author.displayAvatarURL({ size: 32 })}" alt="">
      <div class="content">
        <span class="author">${m.author.tag}</span>
        <span class="time">${m.createdAt.toLocaleString('fr-FR')}</span>
        <p>${m.content || '<em>[Pas de contenu]</em>'}</p>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Transcript — ${ticket.ticketId}</title>
<style>
  body { font-family: sans-serif; background: #36393f; color: #dcddde; padding: 20px; }
  h1 { color: #fff; }
  .message { display: flex; align-items: flex-start; margin: 10px 0; }
  .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; }
  .author { font-weight: bold; color: #fff; margin-right: 8px; }
  .time { font-size: 0.75em; color: #72767d; }
  p { margin: 4px 0; }
</style>
</head>
<body>
<h1>Transcript — ${ticket.ticketId}</h1>
<p>Serveur : ${guild.name} | Créé par : <@${ticket.userId}></p>
<hr>
${rows}
</body>
</html>`;
}
