const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tatu_yotoqxona',
  user: process.env.DB_USER || 'tatu_admin',
  password: process.env.DB_PASSWORD || 'TatuSecure2024x',
});

// Agar .env dagi parol noto'g'ri bo'lsa yoki topilmasa, baribir shu paroldan foydalanadi:
if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD !== 'TatuSecure2024x') {
  pool.options.password = 'TatuSecure2024x';
}

pool.on('connect', () => {
  console.log('✅ PostgreSQL ga ulandi');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL xatosi:', err);
});

module.exports = pool;
