const jwt = require('jsonwebtoken');
const pool = require('../db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token topilmadi' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.id]);
    
    if (!result.rows[0]) return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    
    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Ruxsat yo\'q' });
  }
  next();
};

module.exports = { auth, requireRole };
