/**
 * ─────────────────────────────────────────────
 *   Commande — &compteur
 *   Crée un compteur automatique dans un salon
 * ─────────────────────────────────────────────
 */

const { ChannelType } = require('discord.js');
const config = require('../../config/config');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData } = require('../../utils/guildUtils');

const TYPES = {
  members:  (guild) => `👥 Membres : ${guild.memberCount}`,
  bots:     (guild) => `🤖 Bots : ${guild.members.cache.filter(m => m.user.bot).size}`,
  channels: (guild) => `📢 Salons : ${guild.channels.cache.size}`,
  roles:    (guild) => `🏷️ Rôles : ${guild.roles.cache.size}`,
};

module.exports = {
  name:        'compteur',
  aliases:     ['counter', 'count'],
  description: 'Crée un compteur automatique dans un salon vocal.',
  usage:       '<members|bots|channels|roles>',
  category:    'Gestion',
  permLevel:   7,
  cooldown:    10000,
  args:        true,
  minArgs:     1,
  botPerms:    ['ManageChannels'],

  async execute(client, message, args, guildData) {
    const type = args[0].toLowerCase();

    if (!TYPES[type]) {
      return message.reply({
        embeds: [errorEmbed(
          `Type invalide. Options : \`members\`, \`bots\`, \`channels\`, \`roles\``,
          null, guildData
        )],
      });
    }

    const name = TYPES[type](message.guild);

    const channel = await message.guild.channels.create({
      name,
      type:   ChannelType.GuildVoice,
      parent: null,
      permissionOverwrites: [{
        id:   message.guild.id,
        deny: ['Connect'],
      }],
    });

    // Sauvegarder
    const counters = [...(guildData?.counters || []), {
      channelId: channel.id,
      type,
      format:    name,
    }];

    await updateGuildData(message.guild.id, { counters });

    // Mise à jour automatique toutes les 5 minutes
    const interval = setInterval(async () => {
      const guild = client.guilds.cache.get(message.guild.id);
      if (!guild) { clearInterval(interval); return; }
      const ch = guild.channels.cache.get(channel.id);
      if (!ch) { clearInterval(interval); return; }
      await ch.setName(TYPES[type](guild)).catch(() => {});
    }, 300000);

    await message.reply({
      embeds: [successEmbed(
        `Compteur **${type}** créé : ${channel}`,
        `${config.emojis.stats} Compteur`, guildData
      )],
    });
  },
};
