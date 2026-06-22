const pool = require('../db');

const getStudents = async (req, res) => {
  try {
    const user = req.user;
    const { floor_id, search, region, faculty } = req.query;
    let query = `
      SELECT s.*, r.room_number, f.floor_number, f.name as floor_name
      FROM students s
      LEFT JOIN rooms r ON r.id = s.room_id
      LEFT JOIN floors f ON f.id = s.floor_id
      WHERE s.is_active = true
    `;
    const params = [];
    let idx = 1;
    if (user.role === 'sardor') {
      query += ` AND f.floor_number = $${idx++}`;
      params.push(user.floor_number);
    } else if (floor_id) {
      query += ` AND f.id = $${idx++}`;
      params.push(floor_id);
    }
    if (search) {
      query += ` AND (s.first_name ILIKE $${idx} OR s.last_name ILIKE $${idx++})`;
      params.push(`%${search}%`);
    }
    query += ' ORDER BY f.floor_number, r.room_number, s.last_name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getStudents error:', err.message);
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const user = req.user;
    const { first_name, last_name, phone, room_number, faculty, region, student_id } = req.body;
    const roomResult = await pool.query(
      'SELECT r.*, f.floor_number, f.id as fid FROM rooms r JOIN floors f ON f.id = r.floor_id WHERE r.room_number = $1',
      [room_number]
    );
    if (!roomResult.rows[0]) return res.status(400).json({ message: 'Xona topilmadi: ' + room_number });
    const room = roomResult.rows[0];
    if (user.role === 'sardor' && room.floor_number !== user.floor_number) {
      return res.status(403).json({ message: 'Faqat o\'z qavatiga qo\'sha olasiz' });
    }
    const result = await pool.query(
      `INSERT INTO students (first_name, last_name, phone, room_id, floor_id, faculty, region, student_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [first_name, last_name, phone, room.id, room.fid, faculty, region, student_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createStudent error:', err.message);
    if (err.code === '23505') return res.status(400).json({ message: 'Bu talaba ID allaqachon mavjud' });
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { first_name, last_name, phone, room_number, faculty, region, student_id } = req.body;
    const roomResult = await pool.query(
      'SELECT r.*, f.floor_number, f.id as fid FROM rooms r JOIN floors f ON f.id = r.floor_id WHERE r.room_number = $1',
      [room_number]
    );
    if (!roomResult.rows[0]) return res.status(400).json({ message: 'Xona topilmadi: ' + room_number });
    const room = roomResult.rows[0];
    if (user.role === 'sardor' && room.floor_number !== user.floor_number) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    const result = await pool.query(
      `UPDATE students SET first_name=$1, last_name=$2, phone=$3, room_id=$4, floor_id=$5, faculty=$6, region=$7, student_id=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [first_name, last_name, phone, room.id, room.fid, faculty, region, student_id || null, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateStudent error:', err.message);
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE students SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'O\'quvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    let query = `SELECT a.*, u.full_name as marked_by_name FROM attendance a LEFT JOIN users u ON u.id = a.marked_by WHERE a.student_id = $1`;
    const params = [id];
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM a.date) = $2 AND EXTRACT(YEAR FROM a.date) = $3`;
      params.push(month, year);
    }
    query += ' ORDER BY a.date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent, getStudentAttendance };
