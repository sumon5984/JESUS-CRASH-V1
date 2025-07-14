const { cmd } = require('../command'); // Adjust this if your path is different
const { Buffer } = require('buffer');

cmd({
  pattern: 'crypte',
  desc: 'Encrypt any text or code using Base64',
  category: 'utility',
  react: '🔐',
  filename: __filename,
}, async (bot, m, text) => {
  if (!text) return m.reply('🔒 Please provide text or code to encrypt.\n\nExample: `.crypte console.log("Dawens")`');

  try {
    const crypte = Buffer.from(text, 'utf-8').toString('base64');
    await m.reply(`🔐 *Your encrypted code (Base64):*\n\n\`\`\`${crypte}\`\`\``);
  } catch (err) {
    console.error(err);
    m.reply('❌ Error occurred while encrypting.');
  }
});
