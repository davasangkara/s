// models/categoryModel.js
const pool = require('./db');

async function getAllCategories() {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id DESC');
    return rows;
  } catch (err) {
    console.error('getAllCategories error:', err.code || err.message);
    return []; // fallback biar halaman tetap render
  }
}

module.exports = { getAllCategories };
