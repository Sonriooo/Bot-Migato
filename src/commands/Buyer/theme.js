/**
 * ─────────────────────────────────────────────
 *   Commande — &theme
 *   Change le thème de couleur du bot (Buyer)
 * ─────────────────────────────────────────────
 */

const config = require('../../config/config');
const { createEmbed, successEmbed, errorEmbed } = require('../../utils/embed');
const { updateGuildData, isBuyer } = require('../../utils/guildUtils');

const THEMES = {
  default:  { main: '#5865F2', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  red:      { main: '#ED4245', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  green:    { main: '#57F287', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  gold:     { main: '#F1C40F', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  purple:   { main: '#9B59B6', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  pink:     { main: '#FF73FA', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  cyan:     { main: '#1ABC9C', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  orange:   { main: '#E67E22', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  black:    { main: '#2C2F33', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
  white:    { main: '#FFFFFF', success: '#57F287', error: '#ED4245', warning: '#FEE75C' },
};

module.exports = {
  name:        'theme',
  aliases:     ['settheme', 'changetheme'],
  description: 'Change le thème de couleur des embeds. (Réservé aux acheteurs)',
  usage:       '<default|red|green|gold|purple|pink|cyan|orange|black|white | #hexcode>',
  category:    'Buyer',
  permLevel:   10,
  cooldown:    5000,
  args:        true,
  minArgs:     1,

  async execute(client, message, args, guildData) {
    const buyer = await isBuyer(message.author.id);
    if (!buyer && message.author.id !== config.botOwner) {
      return message.reply({ embeds: [errorEmbed('Cette commande est réservée aux acheteurs du bot.', null, guildData)] });
    }

    const input = args[0].toLowerCase();

    let color;
    if (THEMES[input]) {
      color = THEMES[input].main;
    } else if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
      color = input.startsWith('#') ? input : `#${input}`;
    } else {
      const themeList = Object.keys(THEMES).join('`, `');
      return message.reply({
        embeds: [errorEmbed(`Thème invalide. Options : \`${themeList}\` ou un code hex.`, null, guildData)],
      });
    }

    await updateGuildData(message.guild.id, { color });

    const preview = createEmbed({
      color,
      title:       `${config.emojis.settings} Thème Modifié`,
      description: `Le thème a été changé en **${input}** (\`${color}\`).\nVoici un aperçu de la nouvelle couleur.`,
      guild:       { ...guildData, color },
    });

    await message.reply({ embeds: [preview] });
  },
};
