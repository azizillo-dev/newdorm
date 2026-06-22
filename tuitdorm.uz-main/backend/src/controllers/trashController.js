const pool = require('../db');

// Bugungi navbatni hisoblash
const getTodayRoom = async (floorId, startRoomId, startDate) => {
  const rooms = await pool.query(
    'SELECT id FROM rooms WHERE floor_id = $1 ORDER BY room_number',
    [floorId]
  );
  const roomList = rooms.rows.map(r => r.id);
  const startIdx = roomList.indexOf(parseInt(startRoomId));
  const daysDiff = Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const todayIdx = (startIdx + daysDiff) % roomList.length;
  return roomList[todayIdx];
};

// Barcha qavatlar uchun axlat jadvalini olish
const getTrashSchedule = async (req, res) => {
  try {
    const user = req.user;
    let floorFilter = '';
    const params = [];
    if (user.role === 'sardor') {
      floorFilter = ' AND f.floor_number = $1';
      params.push(user.floor_number);
    }

    const floors = await pool.query(
      `SELECT f.id, f.floor_number, f.name, ts.current_room_id, ts.start_date
       FROM floors f
       LEFT JOIN trash_schedule ts ON ts.floor_id = f.id
       WHERE f.is_active = true ${floorFilter}
       ORDER BY f.floor_number`,
      params
    );

    const today = new Date().toISOString().split('T')[0];
    const result = [];

    for (const floor of floors.rows) {
      let todayRoomId = null;
      let todayRoomNumber = null;

      if (floor.current_room_id && floor.start_date) {
        todayRoomId = await getTodayRoom(floor.id, floor.current_room_id, floor.start_date);
        const roomRes = await pool.query('SELECT room_number FROM rooms WHERE id = $1', [todayRoomId]);
        todayRoomNumber = roomRes.rows[0]?.room_number;
      }

      const logRes = await pool.query(
        'SELECT * FROM trash_logs WHERE floor_id = $1 AND date = $2',
        [floor.id, today]
      );

      result.push({
        floor_id: floor.id,
        floor_number: floor.floor_number,
        floor_name: floor.name,
        today_room_id: todayRoomId,
        today_room_number: todayRoomNumber,
        start_date: floor.start_date,
        start_room_id: floor.current_room_id,
        log: logRes.rows[0] || null
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

// Navbatni boshlash/belgilash
const setTrashStart = async (req, res) => {
  try {
    const { floor_id, start_room_id, start_date } = req.body;
    await pool.query(
      `INSERT INTO trash_schedule (floor_id, current_room_id, start_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (floor_id) DO UPDATE SET current_room_id=$2, start_date=$3`,
      [floor_id, start_room_id, start_date || new Date().toISOString().split('T')[0]]
    );
    res.json({ message: 'Navbat belgilandi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

// To'kdi/to'kmadi belgilash
const markTrash = async (req, res) => {
  try {
    const { floor_id, status, date } = req.body;
    const today = date || new Date().toISOString().split('T')[0];

    const scheduleRes = await pool.query('SELECT * FROM trash_schedule WHERE floor_id = $1', [floor_id]);
    if (!scheduleRes.rows[0]) return res.status(400).json({ message: 'Avval navbatni belgilang' });

    const todayRoomId = await getTodayRoom(floor_id, scheduleRes.rows[0].current_room_id, scheduleRes.rows[0].start_date);

    await pool.query(
      `INSERT INTO trash_logs (floor_id, room_id, date, status, marked_by, marked_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (floor_id, date) DO UPDATE SET status=$4, marked_by=$5, marked_at=NOW()`,
      [floor_id, todayRoomId, today, status, req.user.id]
    );

    res.json({ message: 'Belgilandi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

// Tarix
const getTrashHistory = async (req, res) => {
  try {
    const { floor_id } = req.query;
    let query = `
      SELECT tl.*, r.room_number, f.floor_number, f.name as floor_name, u.full_name as marked_by_name
      FROM trash_logs tl
      JOIN rooms r ON r.id = tl.room_id
      JOIN floors f ON f.id = tl.floor_id
      LEFT JOIN users u ON u.id = tl.marked_by
      WHERE 1=1
    `;
    const params = [];
    if (floor_id) { query += ' AND tl.floor_id = $1'; params.push(floor_id); }
    query += ' ORDER BY tl.date DESC LIMIT 30';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

module.exports = { getTrashSchedule, setTrashStart, markTrash, getTrashHistory };
