const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'Login yoki parol noto\'g\'ri' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Login yoki parol noto\'g\'ri' });

    // Login tarixi
    await pool.query(
      'INSERT INTO login_logs (user_id, ip_address, user_agent, status) VALUES ($1, $2, $3, $4)',
      [user.id, req.ip, req.headers['user-agent'], 'success']
    );

    // Last login yangilash
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        floor_number: user.floor_number,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getProfile = async (req, res) => {
  const { password, ...user } = req.user;
  res.json(user);
};

const updatePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Eski parol noto\'g\'ri' });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hash, user.id]);

    res.json({ message: 'Parol muvaffaqiyatli yangilandi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const adminUpdatePassword = async (req, res) => {
  try {
    const { user_id, new_password } = req.body;
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hash, user_id]);
    res.json({ message: 'Parol yangilandi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

module.exports = { login, getProfile, updatePassword, adminUpdatePassword };
