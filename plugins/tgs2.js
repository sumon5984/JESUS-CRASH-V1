// Plugin tgs2.js — Convert Telegram animated stickers to 
const axios = require('axios');
const sharp = require('sharp');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { cmd } = require('../command');

cmd({
  pattern: 'tgs2',
  alias: ['tgsticker', 'telegramsticker'],
  react: '🎴',
  desc: 'Download Telegram sticker pack and convert to WhatsApp',
  category: 'spam',
  filename: __filename
}, async (conn, mek, m, { from, reply, args, pushname }) => {
  try {
    /*─────────────────── VALIDATION ───────────────────*/
    if (!args[0])
      return reply('*Please provide a Telegram sticker-pack link.*\nExample:\n.tgs https://t.me/addstickers/meme');

    const url = args.join(' ');
    const name = url.split('/addstickers/')[1];
    if (!name) return reply('❌ Invalid Telegram sticker link.');

    /*─────────────────── TELEGRAM API ───────────────────*/
    const botToken = process.env.TELEGRAM_TOKEN || '7627651583:AAHvQNSSwGEZEfQkjyAV5alG8pigXQY0948';
    const setInfo = await axios.get(
      `https://api.telegram.org/bot${botToken}/getStickerSet`,
      { params: { name } }
    );

    const set = setInfo.data.result;

    /* blok animated */
    if (set.is_animated || set.is_video)
      return reply('⚠️ Animated / video Telegram stickers (.tgs/.webm) are not supported.');

    const header =
      `*TELEGRAM STICKER*\n` +
      `• *Pack:* ${set.title}\n` +
      `• *Stickers:* ${set.stickers.length}\n\n` +
      `⬇️ Converting…`;

    await conn.sendMessage(
      from,
      { image: { url: 'https://files.catbox.moe/06cgye.jpg' }, caption: header },
      { quoted: mek }
    );

    /*─────────────────── LOOP & CONVERT ───────────────────*/
    for (const tgSticker of set.stickers) {
      // get file path
      const file = await axios.get(
        `https://api.telegram.org/bot${botToken}/getFile`,
        { params: { file_id: tgSticker.file_id } }
      );

      // download original PNG web file
      const imgBuf = (
        await axios.get(
          `https://api.telegram.org/file/bot${botToken}/${file.data.result.file_path}`,
          { responseType: 'arraybuffer' }
        )
      ).data;

      /* resize & compress */
      const resized = await sharp(imgBuf)
        .resize({ width: 512, height: 512, fit: 'inside' })
        .webp({ quality: 60 })          // adjust quality ↓ if still too big
        .toBuffer();

      /* build WhatsApp sticker */
      const waSticker = new Sticker(resized, {
        pack: '𝐒𝐇𝐎𝐓𝐓𝐀𓅓𝐆𝐎𝐃𒋲𝐒𝐓𝐈𝐋𝐄𝐒𒋲𝗩𝗢𝗜𝗗 —͟͟͞͞𖣘 𒋲𝐃𝐀𝐖𝐄𝐍𝐒ᵈᵉᵐᵒⁿˢ𒋲 𓄂𓆩 𝟏𝟖𝟎𝟗 𓆪',
        author: pushname || '𝐏𝐫𝐞́𝐬𝐞𝐧𝐜𝐞 𝐪𝐮𝐢 𝐧𝐞 𝐬’𝐚𝐧𝐧𝐨𝐧𝐜𝐞 𝐩𝐚𝐬, 𝐞𝐥𝐥𝐞 𝐬𝐞 𝐟𝐚𝐢𝐭 𝐬𝐞𝐧𝐭𝐢𝐫…',
        type: StickerTypes.FULL,
      });

      await conn.sendMessage(
        from,
        { sticker: await waSticker.toBuffer() },
        { quoted: mek }
      );

      await new Promise(r => setTimeout(r, 1000)); // anti-spam delay
    }

    reply('✅ Done! Sticker pack sent.');

  } catch (err) {
    console.error('TGS ERROR:', err);
    reply('❌ Error converting the sticker pack. Try again or choose a smaller pack.');
  }
});
