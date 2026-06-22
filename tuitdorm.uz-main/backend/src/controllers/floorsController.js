const pool = require('../db');

const getFloors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.full_name as sardor_name, u.phone as sardor_phone,
       COUNT(s.id) as student_count
       FROM floors f
       LEFT JOIN users u ON u.id = f.sardor_id
       LEFT JOIN students s ON s.floor_id = f.id AND s.is_active = true
       WHERE f.is_active = true
       GROUP BY f.id, u.full_name, u.phone
       ORDER BY f.floor_number`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const createFloor = async (req, res) => {
  try {
    const { floor_number, name, sardor_id } = req.body;
    const result = await pool.query(
      'INSERT INTO floors (floor_number, name, sardor_id) VALUES ($1, $2, $3) RETURNING *',
      [floor_number, name, sardor_id || null]
    );

    // Xonalarni avtomatik yaratish
    const rooms = [];
    for (let i = 1; i <= 12; i++) {
      const roomNum = `${floor_number}${String(i).padStart(2, '0')}`;
      rooms.push(pool.query(
        'INSERT INTO rooms (room_number, floor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [roomNum, result.rows[0].id]
      ));
    }
    await Promise.all(rooms);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Bu qavat allaqachon mavjud' });
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sardor_id } = req.body;
    const result = await pool.query(
      'UPDATE floors SET name = $1, sardor_id = $2 WHERE id = $3 RETURNING *',
      [name, sardor_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE floors SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'Qavat o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getFloorRooms = async (req, res) => {
  try {
    const { floor_number } = req.params;
    const result = await pool.query(
      `SELECT r.*, COUNT(s.id) as student_count
       FROM rooms r
       LEFT JOIN students s ON s.room_id = r.id AND s.is_active = true
       JOIN floors f ON f.id = r.floor_id
       WHERE f.floor_number = $1
       GROUP BY r.id ORDER BY r.room_number`,
      [floor_number]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

module.exports = { getFloors, createFloor, updateFloor, deleteFloor, getFloorRooms };
