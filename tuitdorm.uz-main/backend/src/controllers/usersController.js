const bcrypt = require('bcryptjs');
const pool = require('../db');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.floor_number, u.phone, u.is_active, u.last_login, u.created_at
       FROM users u WHERE u.is_active = true ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, full_name, role, floor_number, phone } = req.body;
    if (role === 'sardor' && !floor_number) return res.status(400).json({ message: 'Sardor uchun qavat tanlash shart' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password, full_name, role, floor_number, phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, username, full_name, role, floor_number, phone`,
      [username, hash, full_name, role, floor_number || null, phone]
    );
    if (role === 'sardor' && floor_number) await pool.query('UPDATE floors SET sardor_id=$1 WHERE floor_number=$2', [result.rows[0].id, floor_number]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Bu username allaqachon band' });
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, floor_number, username } = req.body;
    if (username) {
      const ex = await pool.query('SELECT id FROM users WHERE username=$1 AND id!=$2', [username, id]);
      if (ex.rows.length > 0) return res.status(400).json({ message: 'Bu username allaqachon band' });
      await pool.query('UPDATE users SET username=$1 WHERE id=$2', [username, id]);
    }
    const result = await pool.query(
      `UPDATE users SET full_name=$1, phone=$2, floor_number=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [full_name, phone, floor_number || null, id]
    );
    if (result.rows[0].role === 'sardor') {
      await pool.query('UPDATE floors SET sardor_id=NULL WHERE sardor_id=$1', [id]);
      if (floor_number) await pool.query('UPDATE floors SET sardor_id=$1 WHERE floor_number=$2', [id, floor_number]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM login_logs WHERE user_id=$1', [id]);
    await pool.query('DELETE FROM notifications WHERE user_id=$1', [id]);
    await pool.query('UPDATE floors SET sardor_id=NULL WHERE sardor_id=$1', [id]);
    await pool.query('UPDATE attendance SET marked_by=NULL WHERE marked_by=$1', [id]);
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

const getLoginLogs = async (req, res) => {
  try {
    const result = await pool.query(`SELECT l.*, u.full_name, u.username FROM login_logs l JOIN users u ON u.id=l.user_id ORDER BY l.created_at DESC LIMIT 100`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.role, u.floor_number,
       CASE WHEN u.last_login > NOW() - INTERVAL '5 minutes' THEN true ELSE false END as is_online,
       u.last_login FROM users u
       WHERE u.is_active=true AND u.role IN ('sardor','superadmin')
       ORDER BY u.last_login DESC NULLS LAST`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const updateUsername = async (req, res) => {
  try {
    const { new_username } = req.body;
    const userId = req.user.id;
    if (!new_username) return res.status(400).json({ message: 'Yangi login kiriting' });
    const ex = await pool.query('SELECT id FROM users WHERE username=$1 AND id!=$2', [new_username, userId]);
    if (ex.rows.length > 0) return res.status(400).json({ message: 'Bu username allaqachon band' });
    await pool.query('UPDATE users SET username=$1, updated_at=NOW() WHERE id=$2', [new_username, userId]);
    res.json({ message: 'Login muvaffaqiyatli yangilandi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getLoginLogs, getOnlineUsers, updateUsername };
