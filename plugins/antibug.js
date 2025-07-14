const { cmd } = require('../command'); // adapte selon estrikti ou

// Yon flag global pou kontwole si antibug aktif oswa pa
let antibugActive = false;

// Kòmand pou aktive/dezaktyve antibug
cmd({
  pattern: 'antibug',
  desc: 'Activate or deactivate antibug protection',
  category: 'main',
  react: '🛡️',
  filename: __filename
}, async (bot, mek) => {
  antibugActive = !antibugActive;
  let msg = antibugActive ? '🛡️ Antibug activated! Harmful messages will be deleted.' : '🛡️ Antibug deactivated.';
  await bot.sendMessage(mek.chat, msg, { quoted: mek });
});


// Fonksyon pou verifye chak mesaj ki rantre
async function handleIncomingMessage(bot, mek) {
  if (!antibugActive) return;

  try {
    // Ranmase tèks mesaj la (kèlkeswa tip li)
    let messageText = '';
    if (mek.message.conversation) messageText = mek.message.conversation;
    else if (mek.message.extendedTextMessage) messageText = mek.message.extendedTextMessage.text;
    else if (mek.message.imageMessage && mek.message.imageMessage.caption) messageText = mek.message.imageMessage.caption;
    else if (mek.message.videoMessage && mek.message.videoMessage.caption) messageText = mek.message.videoMessage.caption;

    if (!messageText) return; // Si pa gen tèks, pa fè anyen

    // Regex karaktè lou, Unicode espesyal ki souvan lakòz freeze
    const heavyUnicode = /[\u2000-\u2FFF\u3000-\uFFFF]/g;

    // Deteksyon mesaj danjere
    const tooLong = messageText.length > 1000; // mesaj ki twò long
    const manyHeavyChars = (messageText.match(heavyUnicode) || []).length > 50; // twòp karaktè lou

    if (tooLong || manyHeavyChars) {
      // Efase mesaj la (bot dwe admin nan gwoup la)
      await bot.deleteMessage(mek.chat, { id: mek.key.id, remoteJid: mek.chat });

      // Optional: blòke moun ki voye mesaj la (dekomante si ou vle)
      // await bot.updateBlockStatus(mek.sender, 'block');

      // Avètisman nan chat la
      await bot.sendMessage(mek.chat, `⚠️ Mesaj sa a te bloke paske li gen karaktè ki ka fè WhatsApp fèkse.`, { quoted: mek });

      console.log(`Antibug: deleted harmful message from ${mek.sender} in ${mek.chat}`);
    }
  } catch (e) {
    console.error('Antibug error:', e);
  }
}


module.exports = {
  handleIncomingMessage,
};
