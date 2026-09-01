const { Events } = require('discord.js');
const config = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');

module.exports = {
  name: Events.GuildRoleCreate,

  async execute(client, role) {
    const guildData = await getGuildData(role.guild.id).catch(() => null);
    const embed = createEmbed({
      color: config.colors.success,
      title: `${config.emojis.role} Rôle créé`,
      description: `Le rôle **${role.name}** a été créé.`,
      fields: [
        { name: `${config.emojis.role} Rôle`, value: `\`${role.name}\``, inline: true },
        { name: `${config.emojis.user} ID`, value: `\`${role.id}\``, inline: true },
      ],
      guild: guildData,
    });

    await sendLog(role.guild, 'rolelogs', embed, guildData);
  },
};
