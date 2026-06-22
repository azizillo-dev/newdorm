const cron = require('node-cron');
const pool = require('../db');
const { sendMessage } = require('./telegramBot');

const startCronJobs = () => {

  // Har kuni ertalab 7:00 da sardorlarga eslatma (Toshkent vaqti)
  cron.schedule('0 7 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sardors = await pool.query(
        `SELECT u.full_name, u.telegram_chat_id, u.floor_number, f.name as floor_name,
         COUNT(s.id) as total,
         COUNT(a.id) as marked
         FROM users u
         JOIN floors f ON f.floor_number = u.floor_number
         LEFT JOIN students s ON s.floor_id = f.id AND s.is_active = true
         LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
         WHERE u.role = 'sardor' AND u.is_active = true AND u.telegram_chat_id IS NOT NULL
         GROUP BY u.id, u.full_name, u.telegram_chat_id, u.floor_number, f.name`,
        [today]
      );
      for (const s of sardors.rows) {
        const unmarked = parseInt(s.total) - parseInt(s.marked);
        if (unmarked > 0) {
          await sendMessage(s.telegram_chat_id,
            `🌅 <b>Xayrli tong, ${s.full_name}!</b>\n\n` +
            `📋 <b>${s.floor_name}</b> davomati belgilanmagan!\n` +
            `👥 Jami: ${s.total} o'quvchi\n` +
            `⏳ Belgilanmagan: <b>${unmarked} ta</b>\n\n` +
            `🔗 https://tuitdorm.uz/attendance`
          );
        }
      }
    } catch (err) {
      console.error('Cron 7:00 xato:', err.message);
    }
  }, { timezone: 'Asia/Tashkent' });

  // Har kuni kechqurun 22:00 da admin ga kunlik hisobot
  cron.schedule('0 22 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const stats = await pool.query(
        `SELECT COUNT(s.id) as total,
         COUNT(CASE WHEN a.status='bor' THEN 1 END) as present,
         COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent,
         COUNT(CASE WHEN a.status IS NULL THEN 1 END) as not_marked
         FROM students s
         LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
         WHERE s.is_active = true`, [today]
      );

      const absent3 = await pool.query(
        `SELECT s.first_name, s.last_name, f.floor_number, r.room_number, COUNT(a.id) as days
         FROM students s
         JOIN floors f ON f.id = s.floor_id
         JOIN rooms r ON r.id = s.room_id
         JOIN attendance a ON a.student_id = s.id
         WHERE s.is_active = true AND a.status IN ('yoq','sababsiz')
         AND a.date >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY s.id, s.first_name, s.last_name, f.floor_number, r.room_number
         HAVING COUNT(a.id) >= 3 ORDER BY days DESC LIMIT 5`
      );

      const admins = await pool.query(
        `SELECT telegram_chat_id FROM users WHERE role='superadmin' AND telegram_chat_id IS NOT NULL AND is_active=true`
      );

      const st = stats.rows[0];
      const dateStr = new Date().toLocaleDateString('uz-UZ');
      let msg = `📊 <b>Kunlik davomat hisoboti</b>\n📅 ${dateStr}\n\n` +
        `👥 Jami: <b>${st.total}</b>\n` +
        `✅ Bor: <b>${st.present}</b>\n` +
        `❌ Yo'q: <b>${st.absent}</b>\n` +
        `⏳ Belgilanmagan: <b>${st.not_marked}</b>\n`;

      if (absent3.rows.length > 0) {
        msg += `\n⚠️ <b>3+ kun yo'q o'quvchilar:</b>\n`;
        for (const s of absent3.rows) {
          msg += `• ${s.last_name} ${s.first_name} — ${s.floor_number}-qavat, ${s.room_number}-xona (${s.days} kun)\n`;
        }
      }
      msg += `\n🔗 https://tuitdorm.uz/dashboard`;

      for (const admin of admins.rows) {
        await sendMessage(admin.telegram_chat_id, msg);
      }
    } catch (err) {
      console.error('Cron 22:00 xato:', err.message);
    }
  }, { timezone: 'Asia/Tashkent' });

  console.log('✅ Cron joblar ishga tushdi');
};

module.exports = { startCronJobs };
