// handler/antitag-handler.js

const warningDB = new Map(); // Kenbe kantite avètisman chak moun
const antiTagStatus = new Map(); // Eta antitag pou chak gwoup
const OWNER_NUMBER = '13058962443'; // Mete nimewo ou la (san @)

async function antiTagHandler(message, bot) {
  try {
    const groupId = message.key.remoteJid;
    if (!groupId?.endsWith('@g.us')) return;

    // Si anti-tag pa aktive pou gwoup sa
    if (!antiTagStatus.get(groupId)) return;

    const contextInfo = message.message?.extendedTextMessage?.contextInfo;
    if (!contextInfo?.mentionedJid) return;

    const mentionedJids = contextInfo.mentionedJid;
    const sender = message.key.participant || message.key.remoteJid;
    const ownerJid = OWNER_NUMBER + '@s.whatsapp.net';

    if (mentionedJids.includes(ownerJid)) {
      await bot.sendMessage(groupId, {
        text: `*DON'T TAG MY OWNER AGAIN!*\n@${sender.split('@')[0]}`,
        mentions: [sender]
      });

      const warnings = warningDB.get(sender) || 0;
      warningDB.set(sender, warnings + 1);

      if (warnings + 1 >= 3) {
        await bot.groupParticipantsUpdate(groupId, [sender], 'remove');
      }
    }
  } catch (e) {
    console.error('❌ AntiTag Error:', e);
  }
}

function enableAntiTag(groupId) {
  antiTagStatus.set(groupId, true);
}

function disableAntiTag(groupId) {
  antiTagStatus.set(groupId, false);
}

function getAntiTagStatus(groupId) {
  return antiTagStatus.get(groupId) || false;
}

module.exports = {
  antiTagHandler,
  enableAntiTag,
  disableAntiTag,
  getAntiTagStatus,
};
