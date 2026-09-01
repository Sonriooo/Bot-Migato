/**
 * ─────────────────────────────────────────────
 *   Commande — &embed
 *   Crée un embed personnalisé via modal
 * ─────────────────────────────────────────────
 */

const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name:        'embed',
  aliases:     ['createembed', 'sendembed'],
  description: 'Crée et envoie un embed personnalisé dans un salon.',
  usage:       '[#salon]',
  category:    'Gestion',
  permLevel:   5,
  cooldown:    5000,

  async execute(client, message, args, guildData) {
    const color   = guildData?.color || config.colors.main;
    const channel = message.mentions.channels.first()
      || (args[0] ? message.guild.channels.cache.get(args[0]) : message.channel);

    if (!channel || channel.type !== 0) {
      return message.reply({ embeds: [errorEmbed('Salon introuvable.', null, guildData)] });
    }

    // Ouvrir un modal pour la saisie
    const modal = new ModalBuilder()
      .setCustomId(`embed_create_${channel.id}`)
      .setTitle('Créer un Embed')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('embed_title')
            .setLabel('Titre (optionnel)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(256)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('embed_description')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('embed_color')
            .setLabel('Couleur (hex, ex: #5865F2)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(7)
            .setPlaceholder('#5865F2')
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('embed_image')
            .setLabel('URL Image (optionnel)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      );

    // Envoyer une réponse temporaire pour pouvoir ouvrir le modal
    await message.reply({ content: 'Ouverture du formulaire...', ephemeral: true }).catch(() => {});

    // Note : les modals ne peuvent être ouverts que depuis des interactions
    // On simule via un message d'instruction
    const instructEmbed = createEmbed({
      color,
      title:       `${config.emojis.edit} Créer un Embed`,
      description: `Répondez à ce message avec le format suivant :\n\n` +
                   `\`\`\`\ntitre: Votre titre\ndescription: Votre description\ncouleur: #5865F2\nimage: https://...\n\`\`\``,
      guild: guildData,
    });

    const prompt = await message.channel.send({ embeds: [instructEmbed] });

    const collector = message.channel.createMessageCollector({
      time:   60000,
      max:    1,
      filter: (m) => m.author.id === message.author.id,
    });

    collector.on('collect', async (m) => {
      await m.delete().catch(() => {});
      await prompt.delete().catch(() => {});

      const lines = m.content.split('\n');
      const data  = {};
      for (const line of lines) {
        const [key, ...val] = line.split(':');
        if (key && val.length) data[key.trim().toLowerCase()] = val.join(':').trim();
      }

      const embedColor = /^#[0-9A-Fa-f]{6}$/.test(data.couleur || '') ? data.couleur : color;

      const finalEmbed = createEmbed({
        color:       embedColor,
        title:       data.titre || null,
        description: data.description || 'Aucune description.',
        image:       data.image || null,
        guild:       guildData,
      });

      await channel.send({ embeds: [finalEmbed] });
      await message.channel.send({ embeds: [createEmbed({ color: config.colors.success, title: `${config.emojis.success} Embed Envoyé`, description: `Embed envoyé dans ${channel}.`, guild: guildData })] });
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        prompt.delete().catch(() => {});
      }
    });
  },
};
