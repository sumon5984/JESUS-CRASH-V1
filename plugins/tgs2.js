// Plugin tgs2.js — Convert Telegram animated stickers to 
const axios = require('axios');
const sharp = require('sharp'); // ajoute sharp pou resize imaj
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
  pattern: 'tg',
  alias: ['tgsticker', 'telegramsticker'],
  react: '🎴',
  desc: 'Download and convert Telegram sticker packs to WhatsApp stickers',
  category: 'spam',
  filename: __filename
}, async (conn, mek, m, { from, reply, args, sender, pushname }) => {
  try {
    if (!args[0]) {
      reply('*Please provide a Telegram sticker pack link.*\n\nExample:\n.tgs https://t.me/addstickers/telegram');
      return;
    }

    const lien = args.join(' ');
    const name = lien.split('/addstickers/')[1];

    if (!name) {
      reply('Invalid Telegram sticker link.');
      return;
    }

    const api = `https://api.telegram.org/bot7025486524:AAGNJ3lMa8610p7OAIycwLtNmF9vG8GfboM/getStickerSet?name=${encodeURIComponent(name)}`;

    const stickers = await axios.get(api);

    let type = stickers.data.result.is_animated ? 'animated sticker' : 'not animated sticker';

    let message = `*TELEGRAM STICKER*\n\n` +
                  `*Producer:* ${stickers.data.result.name}\n` +
                  `*Type:* ${type}\n` +
                  `*Length:* ${stickers.data.result.stickers.length}\n\n` +
                  `> Please wait...`;

    await conn.sendMessage(
      from,
      {
        image: { url: 'https://files.catbox.moe/06cgye.jpg' },
        caption: message,
      },
      { quoted: mek }
    );

    for (let i = 0; i < stickers.data.result.stickers.length; i++) {
      try {
        // Get file path from Telegram
        const file = await axios.get(`https://api.telegram.org/bot7025486524:AAGNJ3lMa8610p7OAIycwLtNmF9vG8GfboM/getFile?file_id=${stickers.data.result.stickers[i].file_id}`);

        // Download sticker image as buffer
        const response = await axios({
          method: 'get',
          url: `https://api.telegram.org/file/bot7025486524:AAGNJ3lMa8610p7OAIycwLtNmF9vG8GfboM/${file.data.result.file_path}`,
          responseType: 'arraybuffer',
        });

        // Resize & compress image to max 512x512 with sharp
        const resizedBuffer = await sharp(response.data)
          .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 50 })
          .toBuffer();

        // Create WhatsApp sticker from resized image
        const sticker = new Sticker(resizedBuffer, {
          pack: '𝐆𝐎𝐃 𝐃𝐀𝐖𝐄𝐍𝐒',
          author: pushname || 'unknown',
          type: StickerTypes.FULL,
          quality: 50,
          background: '#000000',
        });

        const stickerBuffer = await sticker.toBuffer();

        // Send sticker message
        await conn.sendMessage(
          from,
          { sticker: stickerBuffer },
          { quoted: mek }
        );

        // Delay 1 second between stickers to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (innerErr) {
        console.error('Error with sticker #' + (i+1), innerErr);
        // Continue next sticker even if one fails
      }
    }

    reply('✅ Sticker pack download complete!');

  } catch (error) {
    console.error('Error processing Telegram sticker pack:', error);
    reply('❌ An error occurred while processing the sticker pack. Please try again.');
  }
});
