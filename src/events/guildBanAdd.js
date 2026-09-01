const { Events } = require('discord.js');
const config = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');

module.exports = {
  name: Events.GuildBanAdd,
  async execute(client, ban) {
    const guildData = await getGuildData(ban.guild.id).catch(() => null);
    const embed = createEmbed({
      color:       config.colors.error,
      title:       `${config.emojis.ban} Membre Banni`,
      description: `**${ban.user.tag}** a été banni.`,
      fields: [
        { name: `${config.emojis.user} Utilisateur`, value: `${ban.user.tag} (\`${ban.user.id}\`)`, inline: true },
        { name: `${config.emojis.list} Raison`,      value: ban.reason || 'Non spécifiée', inline: true },
      ],
      thumbnail: ban.user.displayAvatarURL({ dynamic: true }),
      guild: guildData,
    });
    await sendLog(ban.guild, 'modlogs', embed, guildData);
  },
};
