const config = require('../../config/config');
const { createEmbed } = require('../../utils/embed');
module.exports = {
  name: 'invite', aliases: ['botinvite', 'invitebot'],
  description: 'Affiche le lien d\'invitation du bot.', usage: '', category: 'Buyer', permLevel: 0, cooldown: 5000,
  async execute(client, message, args, guildData) {
    const color     = guildData?.color || config.colors.main;
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
    const supportUrl = config.links?.support || config.supportServer || 'https://discord.gg/thWKDwRPA3';

    const embed = createEmbed({
      color,
      title:       `${config.emojis.invite} Inviter ${client.user.username}`,
      description: `[Cliquez ici pour m'inviter sur votre serveur !](${inviteUrl})\n\n**Support :** [Serveur Discord](${supportUrl})`,
      thumbnail:   client.user.displayAvatarURL({ dynamic: true }),
      guild:       guildData,
    });
    await message.reply({ embeds: [embed] });
  },
};
