/**
 * ─────────────────────────────────────────────
 *   Commande — &help
 *   Dashboard d'aide interactif avec menus
 * ─────────────────────────────────────────────
 */

const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');

const config      = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');
const { getPermLevel, getPermName } = require('../../utils/permissions');

module.exports = {
  name:        'help',
  aliases:     ['h', 'aide', 'commands'],
  description: 'Affiche le menu d\'aide interactif du bot.',
  usage:       '[commande]',
  category:    'Public',
  permLevel:   0,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const prefix = guildData?.prefix || config.prefix;
    const color  = guildData?.color  || config.colors.main;

    // ── Recherche d'une commande spécifique ───
    if (args[0]) {
      const cmdName = args[0].toLowerCase();
      const cmd     = client.commands.get(cmdName)
        || client.commands.get(client.aliases.get(cmdName));

      if (!cmd) {
        return message.reply({
          embeds: [errorEmbed(`Commande \`${cmdName}\` introuvable.`, null, guildData)],
        });
      }

      const embed = createEmbed({
        color,
        title:       `${config.emojis.search} Commande : ${prefix}${cmd.name}`,
        description: cmd.description || 'Aucune description.',
        thumbnail:   client.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: `${config.emojis.arrow} Utilisation`,   value: `\`${prefix}${cmd.name} ${cmd.usage || ''}\``.trim(), inline: true },
          { name: `${config.emojis.list} Catégorie`,      value: cmd.category || 'Inconnue', inline: true },
          { name: `${config.emojis.shield} Permission`,   value: getPermName(cmd.permLevel || 0), inline: true },
          { name: `${config.emojis.time} Cooldown`,       value: `${(cmd.cooldown || 3000) / 1000}s`, inline: true },
          {
            name:   `${config.emojis.dot} Alias`,
            value:  cmd.aliases?.length ? cmd.aliases.map(a => `\`${a}\``).join(', ') : 'Aucun',
            inline: true,
          },
          {
            name:   `${config.emojis.bot} Permissions Bot`,
            value:  cmd.botPerms?.length ? cmd.botPerms.join(', ') : 'Aucune',
            inline: true,
          },
        ],
        guild: guildData,
      });

      return message.reply({ embeds: [embed] });
    }

    // ── Menu principal ─────────────────────────
    const userLevel = await getPermLevel(message.member, guildData);

    const categories = {
      Public:     { emoji: '🌐', label: 'Public',      desc: 'Commandes accessibles à tous' },
      Moderation: { emoji: '⚔️',  label: 'Modération',  desc: 'Commandes de modération' },
      Logs:       { emoji: '📋',  label: 'Logs',        desc: 'Configuration des journaux' },
      Gestion:    { emoji: '⚙️',  label: 'Gestion',     desc: 'Gestion du serveur' },
      Giveaway:   { emoji: '🎉',  label: 'Giveaway',    desc: 'Système de cadeaux' },
      Antiraid:   { emoji: '🛡️',  label: 'Antiraid',    desc: 'Protection anti-raid' },
      Owner:      { emoji: '👑',  label: 'Owner',       desc: 'Commandes propriétaire' },
      Buyer:      { emoji: '💎',  label: 'Buyer',       desc: 'Commandes acheteur' },
    };

    // Compter les commandes par catégorie
    const cmdCount = {};
    for (const [, cmd] of client.commands) {
      cmdCount[cmd.category] = (cmdCount[cmd.category] || 0) + 1;
    }

    const mainEmbed = createEmbed({
      color,
      title:       `${config.emojis.bot} ${config.botName} — Aide`,
      description: `Bienvenue dans le menu d'aide de **${config.botName}** !\n\n` +
                   `Préfixe : \`${prefix}\` | Commandes : \`${client.commands.size}\`\n\n` +
                   `Sélectionnez une catégorie dans le menu ci-dessous.`,
      thumbnail:   client.user.displayAvatarURL({ dynamic: true }),
      fields: Object.entries(categories).map(([key, val]) => ({
        name:   `${val.emoji} ${val.label}`,
        value:  `${val.desc}\n\`${cmdCount[key] || 0} commande(s)\``,
        inline: true,
      })),
      author: {
        name:    message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      },
      guild: guildData,
    });

    // Menu déroulant des catégories
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('📂 Sélectionnez une catégorie...')
      .addOptions(
        Object.entries(categories).map(([key, val]) => ({
          label:       val.label,
          description: val.desc,
          value:       key,
          emoji:       val.emoji,
        }))
      );

    // Boutons
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('help_home')
        .setLabel('Accueil')
        .setEmoji('🏠')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('Support')
        .setEmoji('💬')
        .setStyle(ButtonStyle.Link)
        .setURL(config.links.support),
      new ButtonBuilder()
        .setLabel('Inviter')
        .setEmoji('📨')
        .setStyle(ButtonStyle.Link)
        .setURL(config.links.invite),
    );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const reply = await message.reply({
      embeds:     [mainEmbed],
      components: [row, buttons],
    });

    // Collecteur d'interactions
    const collector = reply.createMessageComponentCollector({
      time:   600000,
      filter: (i) => i.user.id === message.author.id,
    });

    collector.on('collect', async (interaction) => {
      await interaction.deferUpdate();

      if (interaction.customId === 'help_home') {
        await reply.edit({ embeds: [mainEmbed], components: [row, buttons] });
        return;
      }

      if (interaction.customId === 'help_category') {
        const category = interaction.values[0];
        const catInfo  = categories[category];

        // Récupérer les commandes de cette catégorie
        const cmds = [...client.commands.values()].filter(c => c.category === category);

        const catEmbed = createEmbed({
          color,
          title:       `${catInfo.emoji} Catégorie : ${catInfo.label}`,
          description: `${catInfo.desc}\n\n**${cmds.length} commande(s) disponible(s)**`,
          thumbnail:   client.user.displayAvatarURL({ dynamic: true }),
          fields:      cmds.map(cmd => ({
            name:   `\`${prefix}${cmd.name}\``,
            value:  `${cmd.description || 'Aucune description.'}\n${config.emojis.shield} Perm: \`${getPermName(cmd.permLevel || 0)}\``,
            inline: true,
          })),
          guild: guildData,
        });

        await reply.edit({ embeds: [catEmbed], components: [row, buttons] });
      }
    });

    collector.on('end', async () => {
      await reply.edit({ components: [] }).catch(() => {});
    });
  },
};
