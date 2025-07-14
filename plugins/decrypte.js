const { cmd } = require('../command'); // Adjust the path if needed
const { Buffer } = require('buffer');

cmd({
  pattern: 'decrypte',
  desc: 'Decrypt Base64 encoded text',
  category: 'utility',
  react: '🧾',
  filename: __filename,
}, async (bot, m, text) => {
  if (!text) return m.reply('🧾 Please provide a Base64 string to decode.\n\nExample: `.decrypte Y29uc29sZS5sb2coIkRhd2VucyBWNyIp`');

  try {
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    await m.reply(`🧾 *Decrypted text:*\n\n\`\`\`${decoded}\`\`\``);
  } catch (err) {
    console.error(err);
    m.reply('❌ Invalid Base64 or error decoding.');
  }
});
