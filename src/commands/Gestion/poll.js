/**
 * ─────────────────────────────────────────────
 *   Commande — &poll
 *   Crée un sondage interactif
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name:        'poll',
  aliases:     ['sondage', 'vote'],
  description: 'Crée un sondage. Séparez les options avec `|`.',
  usage:       '<question> | <option1> | <option2> [| option3...]',
  category:    'Gestion',
  permLevel:   3,
  cooldown:    10000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const color = guildData?.color || config.colors.main;
    const input = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);

    if (input.length < 2) {
      return message.reply({
        embeds: [errorEmbed(
          'Format invalide.\n**Exemple :** `&poll Quelle couleur ? | Rouge | Bleu | Vert`',
          null, guildData
        )],
      });
    }

    if (input.length > 10) {
      return message.reply({ embeds: [errorEmbed('Maximum 9 options par sondage.', null, guildData)] });
    }

    const question = input[0];
    const options  = input.slice(1);

    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

    const embed = createEmbed({
      color,
      title:       `${config.emojis.poll} Sondage`,
      description: `**${question}**\n\n` + options.map((opt, i) => `${numberEmojis[i]} ${opt}`).join('\n'),
      fields: [
        { name: `${config.emojis.user} Créé par`, value: `${message.author}`, inline: true },
        { name: `${config.emojis.list} Options`,  value: `${options.length}`, inline: true },
      ],
      footer: { text: 'Réagissez avec les emojis pour voter !' },
      guild:  guildData,
    });

    await message.delete().catch(() => {});

    const pollMessage = await message.channel.send({ embeds: [embed] });

    // Ajouter les réactions
    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(numberEmojis[i]).catch(() => {});
    }
  },
};
