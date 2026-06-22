const axios = require('axios');
const TOKEN = '8730250046:AAHRgkqCl4Enk88fUPA5vEwaPv1aX8tA-ss';

const sendMessage = async (chatId, text) => {
  try {
    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error('Telegram xato:', err.message);
  }
};

module.exports = { sendMessage, TOKEN };
