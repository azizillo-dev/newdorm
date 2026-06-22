const pool = require('../db');

const getAttendance = async (req, res) => {
  try {
    const user = req.user;
    const { date, floor_id, floor_number } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let floorFilter = '';
    const params = [targetDate];
    let paramIdx = 2;

    if (user.role === 'sardor') {
      floorFilter = ` AND f.floor_number = $${paramIdx++}`;
      params.push(user.floor_number);
    } else if (floor_number) {
      floorFilter = ` AND f.floor_number = $${paramIdx++}`;
      params.push(floor_number);
    } else if (floor_id) {
      floorFilter = ` AND f.id = $${paramIdx++}`;
      params.push(floor_id);
    }

    const result = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.phone, s.faculty, s.region,
       r.room_number, f.floor_number, f.name as floor_name,
       a.id as attendance_id, a.status, a.reason, a.note, a.marked_at,
       u.full_name as marked_by_name
       FROM students s
       LEFT JOIN rooms r ON r.id = s.room_id
       LEFT JOIN floors f ON f.id = s.floor_id
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
       LEFT JOIN users u ON u.id = a.marked_by
       WHERE s.is_active = true ${floorFilter}
       ORDER BY f.floor_number, r.room_number, s.last_name`,
      params
    );

    // Bayram tekshirish
    const holiday = await pool.query('SELECT * FROM holidays WHERE date = $1', [targetDate]);

    res.json({
      date: targetDate,
      is_holiday: holiday.rows.length > 0,
      holiday_name: holiday.rows[0]?.name || null,
      students: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const markAttendance = async (req, res) => {
  try {
    const user = req.user;
    const { student_id, date, status, reason, note } = req.body;

    // Sardor faqat o'z qavatini belgilay oladi
    const studentCheck = await pool.query(
      'SELECT s.*, f.floor_number FROM students s JOIN floors f ON f.id = s.floor_id WHERE s.id = $1',
      [student_id]
    );
    if (!studentCheck.rows[0]) return res.status(404).json({ message: 'O\'quvchi topilmadi' });
    if (user.role === 'sardor' && studentCheck.rows[0].floor_number !== user.floor_number) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }

    const result = await pool.query(
      `INSERT INTO attendance (student_id, date, status, reason, note, marked_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (student_id, date)
       DO UPDATE SET status=$3, reason=$4, note=$5, marked_by=$6, updated_at=NOW()
       RETURNING *`,
      [student_id, date, status, reason || null, note || null, user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const markAllPresent = async (req, res) => {
  try {
    const user = req.user;
    const { date, floor_number } = req.body;

    const targetFloor = user.role === 'sardor' ? user.floor_number : floor_number;

    const students = await pool.query(
      `SELECT s.id FROM students s
       JOIN floors f ON f.id = s.floor_id
       WHERE s.is_active = true AND f.floor_number = $1`,
      [targetFloor]
    );

    const promises = students.rows.map(s =>
      pool.query(
        `INSERT INTO attendance (student_id, date, status, marked_by)
         VALUES ($1, $2, 'bor', $3)
         ON CONFLICT (student_id, date) DO NOTHING`,
        [s.id, date, user.id]
      )
    );
    await Promise.all(promises);

    res.json({ message: `${students.rows.length} ta o\'quvchi "bor" deb belgilandi` });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getAbsentAlert = async (req, res) => {
  try {
    const user = req.user;
    let floorFilter = '';
    const params = [];
    
    if (user.role === 'sardor') {
      floorFilter = ' AND f.floor_number = $1';
      params.push(user.floor_number);
    }

    const result = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, r.room_number, f.floor_number,
       COUNT(a.id) as absent_days,
       MAX(a.date) as last_absent_date
       FROM students s
       JOIN floors f ON f.id = s.floor_id
       JOIN rooms r ON r.id = s.room_id
       JOIN attendance a ON a.student_id = s.id
       WHERE s.is_active = true
       AND a.status IN ('yoq', 'sababsiz')
       AND a.date >= CURRENT_DATE - INTERVAL '7 days' ${floorFilter}
       GROUP BY s.id, s.first_name, s.last_name, r.room_number, f.floor_number
       HAVING COUNT(a.id) >= 3
       ORDER BY absent_days DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

module.exports = { getAttendance, markAttendance, markAllPresent, getAbsentAlert };
