const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const pool = require('../db');

const authCtrl = require('../controllers/authController');
const usersCtrl = require('../controllers/usersController');
const floorsCtrl = require('../controllers/floorsController');
const studentsCtrl = require('../controllers/studentsController');
const attendanceCtrl = require('../controllers/attendanceController');
const reportsCtrl = require('../controllers/reportsController');
const trashCtrl = require('../controllers/trashController');

router.get('/public/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = await pool.query(`SELECT COUNT(s.id) as total, COUNT(CASE WHEN a.status='bor' THEN 1 END) as present, COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent, COUNT(CASE WHEN a.status='sababli' THEN 1 END) as excused, COUNT(CASE WHEN a.status IS NULL THEN 1 END) as not_marked FROM students s LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1 WHERE s.is_active = true`, [today]);
    const floorStats = await pool.query(`SELECT f.floor_number, f.name, COUNT(s.id) as total, COUNT(CASE WHEN a.status='bor' THEN 1 END) as present, COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent FROM floors f LEFT JOIN students s ON s.floor_id = f.id AND s.is_active = true LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1 WHERE f.is_active = true GROUP BY f.id, f.floor_number, f.name ORDER BY f.floor_number`, [today]);
    const weekTrend = await pool.query(`SELECT a.date, COUNT(CASE WHEN a.status='bor' THEN 1 END) as present, COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent FROM attendance a WHERE a.date >= CURRENT_DATE - INTERVAL '7 days' GROUP BY a.date ORDER BY a.date`);
    res.json({ today: todayStats.rows[0], floors: floorStats.rows, week_trend: weekTrend.rows });
  } catch (err) { res.status(500).json({ message: 'Xato' }); }
});

router.post('/auth/login', authCtrl.login);
router.get('/auth/profile', auth, authCtrl.getProfile);
router.put('/auth/password', auth, authCtrl.updatePassword);
router.put('/auth/admin-password', auth, requireRole('superadmin'), authCtrl.adminUpdatePassword);

router.get('/users', auth, requireRole('superadmin'), usersCtrl.getUsers);
router.post('/users', auth, requireRole('superadmin'), usersCtrl.createUser);
router.put('/users/update-username', auth, usersCtrl.updateUsername);
router.get('/users/online', auth, requireRole('superadmin'), usersCtrl.getOnlineUsers);
router.get('/users/login-logs', auth, requireRole('superadmin'), usersCtrl.getLoginLogs);
router.put('/users/:id', auth, requireRole('superadmin'), usersCtrl.updateUser);
router.delete('/users/:id', auth, requireRole('superadmin'), usersCtrl.deleteUser);

router.get('/floors', auth, floorsCtrl.getFloors);
router.post('/floors', auth, requireRole('superadmin'), floorsCtrl.createFloor);
router.put('/floors/:id', auth, requireRole('superadmin'), floorsCtrl.updateFloor);
router.delete('/floors/:id', auth, requireRole('superadmin'), floorsCtrl.deleteFloor);
router.get('/floors/:floor_number/rooms', auth, floorsCtrl.getFloorRooms);

router.get('/students', auth, studentsCtrl.getStudents);
router.post('/students', auth, requireRole('superadmin', 'sardor'), studentsCtrl.createStudent);
router.put('/students/:id', auth, requireRole('superadmin', 'sardor'), studentsCtrl.updateStudent);
router.delete('/students/:id', auth, requireRole('superadmin', 'sardor'), studentsCtrl.deleteStudent);
router.get('/students/:id/attendance', auth, studentsCtrl.getStudentAttendance);

router.get('/attendance', auth, attendanceCtrl.getAttendance);
router.post('/attendance', auth, requireRole('superadmin', 'sardor'), attendanceCtrl.markAttendance);
router.post('/attendance/mark-all-present', auth, requireRole('superadmin', 'sardor'), attendanceCtrl.markAllPresent);
router.get('/attendance/alerts', auth, attendanceCtrl.getAbsentAlert);

router.get('/reports/stats', auth, reportsCtrl.getStats);
router.get('/reports/daily', auth, reportsCtrl.getDailyReport);
router.get('/reports/monthly', auth, reportsCtrl.getMonthlyReport);
router.get('/reports/export', auth, reportsCtrl.exportExcel);

router.get('/holidays', auth, reportsCtrl.getHolidays);
router.post('/holidays', auth, requireRole('superadmin'), reportsCtrl.addHoliday);
router.delete('/holidays/:id', auth, requireRole('superadmin'), reportsCtrl.deleteHoliday);

router.get('/trash', auth, trashCtrl.getTrashSchedule);
router.post('/trash/start', auth, requireRole('superadmin', 'sardor'), trashCtrl.setTrashStart);
router.post('/trash/mark', auth, requireRole('superadmin', 'sardor'), trashCtrl.markTrash);
router.get('/trash/history', auth, trashCtrl.getTrashHistory);

module.exports = router;

// Telegram
const { sendMessage } = require('../utils/telegramBot');
router.post('/telegram/connect', auth, async (req, res) => {
  try {
    const { chat_id } = req.body;
    await pool.query('UPDATE users SET telegram_chat_id=$1 WHERE id=$2', [chat_id, req.user.id]);
    await sendMessage(chat_id, '✅ <b>TATU Yotoqxona Bot</b> muvaffaqiyatli ulandi!\n\n🏛 Endi bildirishnomalar olasiz.');
    res.json({ message: 'Telegram ulandi!' });
  } catch (err) { res.status(500).json({ message: 'Xato: ' + err.message }); }
});

router.post('/telegram/test', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT telegram_chat_id FROM users WHERE id=$1', [req.user.id]);
    const chatId = result.rows[0]?.telegram_chat_id;
    if (!chatId) return res.status(400).json({ message: 'Telegram ulanmagan. Avval ulang.' });
    await sendMessage(chatId, '🔔 Test xabar — TATU Yotoqxona tizimidan!');
    res.json({ message: 'Test xabar yuborildi!' });
  } catch (err) { res.status(500).json({ message: 'Xato: ' + err.message }); }
});

router.get('/telegram/status', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT telegram_chat_id FROM users WHERE id=$1', [req.user.id]);
    res.json({ connected: !!result.rows[0]?.telegram_chat_id, chat_id: result.rows[0]?.telegram_chat_id });
  } catch (err) { res.status(500).json({ message: 'Xato' }); }
});
