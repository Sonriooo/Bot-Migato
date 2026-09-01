/**
 * ─────────────────────────────────────────────
 *   Commande — &lockdown
 *   Verrouille tous les salons textuels
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { successEmbed, loadingEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

module.exports = {
  name:        'lockdown',
  aliases:     ['lock', 'lockall'],
  description: 'Verrouille tous les salons textuels du serveur.',
  usage:       '[raison]',
  category:    'Antiraid',
  permLevel:   8,
  cooldown:    10000,
  botPerms:    ['ManageChannels'],

  async execute(client, message, args, guildData) {
    const reason = args.join(' ') || 'Lockdown activé';
    const reply  = await message.reply({ embeds: [loadingEmbed('Verrouillage de tous les salons...', guildData)] });

    let count = 0;
    for (const [, channel] of message.guild.channels.cache) {
      if (channel.type === 0 || channel.type === 5) {
        await channel.permissionOverwrites.edit(message.guild.id, {
          SendMessages: false,
        }, { reason: `Lockdown par ${message.author.tag} : ${reason}` }).catch(() => {});
        count++;
      }
    }

    await updateGuildData(message.guild.id, { lockdown: true });

    await reply.edit({
      embeds: [successEmbed(
        `🔒 **Lockdown activé** — **${count}** salon(s) verrouillé(s).\n**Raison :** ${reason}`,
        `${config.emojis.raid} Lockdown`, guildData
      )],
    });
  },
};
