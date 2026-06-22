require('dotenv').config();
const pool = require('./db');

const migrate = async () => {
  try {
    console.log('🔄 Baza yangilanmoqda...');

    // 1. Yangi ustunlarni qo'shish
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS floor_number INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    `).catch(e => console.log('Ustunlar qoshishda xato (ehtimol eski versiya):', e.message));

    // 2. login_logs jadvalini yaratish
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        ip_address VARCHAR(50),
        user_agent TEXT,
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. notifications jadvalini yaratish
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(200),
        message TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 4. holidays jadvalini yaratish
    await pool.query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Baza muvaffaqiyatli yangilandi!');
  } catch (err) {
    console.error('❌ Xatolik:', err.message);
  } finally {
    process.exit(0);
  }
};

migrate();
