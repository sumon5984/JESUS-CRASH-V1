// commands/antitag.js

const { cmd } = require('../command');
const {
  enableAntiTag,
  disableAntiTag,
  getAntiTagStatus
} = require('../handler/antitag-handler');

cmd({
  pattern: 'antitag',
  desc: 'Enable/Disable anti-tag for owner',
  category: 'group',
  react: '⚠️',
  fromMe: true,
  filename: __filename,
}, async (bot, m, text) => {
  try {
    const groupId = m.chat;
    if (!groupId.endsWith('@g.us')) return m.reply('❗ Only works in groups.');

    const arg = (text || '').trim().toLowerCase();

    if (arg === 'on') {
      enableAntiTag(groupId);
      return m.reply('🛡️ Anti-tag enabled for this group.');
    }

    if (arg === 'off') {
      disableAntiTag(groupId);
      return m.reply('❌ Anti-tag disabled.');
    }

    if (arg === 'status') {
      const status = getAntiTagStatus(groupId) ? '✅ ENABLED' : '❌ DISABLED';
      return m.reply(`🔍 Anti-tag Status: ${status}`);
    }

    m.reply(
      `🛡️ *Anti-tag commands:*\n` +
      `• antitag on — Enable\n` +
      `• antitag off — Disable\n` +
      `• antitag status — Check`
    );
  } catch (err) {
    console.error(err);
    m.reply('❌ An error occurred.');
  }
});
