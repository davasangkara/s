// models/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// Cek koneksi saat boot tapi JANGAN matiin app kalau gagal
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✅ MySQL connected to ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
  } catch (err) {
    console.error('❌ MySQL connection failed at startup:', err.code || err.message);
    console.error('   Hint: Periksa DB_HOST/PORT/USER/PASS/NAME dan kebutuhan SSL di provider DB-mu.');
  }
})();

module.exports = pool;
