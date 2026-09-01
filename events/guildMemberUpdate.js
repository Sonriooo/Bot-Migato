const { Events } = require('discord.js');
const config = require('../config/config');
const { createEmbed } = require('../utils/embed');
const { sendLog, getGuildData } = require('../utils/guildUtils');

module.exports = {
  name: Events.GuildMemberUpdate,

  async execute(client, oldMember, newMember) {
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;
    const added = newRoles.filter((role) => !oldRoles.has(role.id));
    const removed = oldRoles.filter((role) => !newRoles.has(role.id));

    if (added.size === 0 && removed.size === 0) return;

    const guildData = await getGuildData(newMember.guild.id).catch(() => null);
    const addedText = added.size ? added.map((role) => `\`${role.name}\``).join(', ') : 'Aucun';
    const removedText = removed.size ? removed.map((role) => `\`${role.name}\``).join(', ') : 'Aucun';

    const embed = createEmbed({
      color: config.colors.warning,
      title: `${config.emojis.role} Rôles modifiés`,
      description: `${newMember} a vu ses rôles mis à jour.`,
      fields: [
        { name: `${config.emojis.add} Ajoutés`, value: addedText, inline: true },
        { name: `${config.emojis.remove} Retirés`, value: removedText, inline: true },
      ],
      thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
      guild: guildData,
    });

    await sendLog(newMember.guild, 'rolelogs', embed, guildData);
  },
};
