const axios = require('axios');
const { cmd } = require('../command');

const apiBaseUrl = 'https://sessions-jesus-crash.onrender.com/?number=';

cmd({
  pattern: 'pairingcode',
  alias: ['paircode', 'linkdevice', 'getsession'],
  desc: 'Get pairing code for a WhatsApp number',
  category: 'tools',
  react: '🔗',
  filename: __filename
}, async (bot, m, args) => {
  const text = args.join(' ').trim();

  if (!text) return m.reply('📱 Please provide a phone number with country code.\n\nExample: +50912345678');

  const phoneNumberMatch = text.match(/^(\+\d{1,3})(\d+)$/);
  if (!phoneNumberMatch) return m.reply('❌ Invalid phone number format.\nMake sure it includes the country code.');

  const countryCode = phoneNumberMatch[1];
  const phoneNumber = phoneNumberMatch[2];

  try {
    await m.react('🕘');

    const response = await axios.post(apiBaseUrl, {
      phoneNumber: countryCode + phoneNumber
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;

    if (result.pairingCode) {
      const message = `✅ *Pairing Code*: ${result.pairingCode}\n🟢 *Status*: ${result.status}`;
      await m.reply(message);
      await m.react('✅');
    } else {
      throw new Error('Invalid response from the server.');
    }
  } catch (error) {
    console.error('Error fetching pairing code:', error.message);
    await m.reply('❌ Error fetching pairing code. Please try again later.');
    await m.react('❌');
  }
});
