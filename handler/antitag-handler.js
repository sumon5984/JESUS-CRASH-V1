const { antiTagHandler } = require('./plugins/antitag');

conn.ev.on('messages.upsert', async (msg) => {
  const m = msg.messages[0];
  if (!m.key.fromMe && m.key.remoteJid?.endsWith('@g.us')) {
    await antiTagHandler(m, conn);
  }
});
