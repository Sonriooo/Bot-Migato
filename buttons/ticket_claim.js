const config = require('../config/config');
const { createEmbed, errorEmbed } = require('../utils/embed');
const Ticket = require('../models/Ticket');

module.exports = {
  customId: 'ticket_claim',
  async execute(client, interaction, guildData) {
    await interaction.deferReply({ ephemeral: true });

    const ticket = await Ticket.findOne({ channelId: interaction.channel.id, status: 'open' });
    if (!ticket) return interaction.editReply({ embeds: [errorEmbed('Ticket introuvable.', null, guildData)] });

    if (ticket.claimedBy) {
      return interaction.editReply({ embeds: [errorEmbed(`Ce ticket est déjà pris en charge par <@${ticket.claimedBy}>.`, null, guildData)] });
    }

    await Ticket.findByIdAndUpdate(ticket._id, { claimedBy: interaction.user.id });

    await interaction.channel.send({
      embeds: [createEmbed({
        color:       config.colors.success,
        title:       `✋ Ticket Pris en Charge`,
        description: `${interaction.user} prend en charge ce ticket.`,
        guild:       guildData,
      })],
    });

    await interaction.editReply({ content: 'Vous avez pris en charge ce ticket.' });
  },
};
