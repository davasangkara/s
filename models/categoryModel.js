const db = require('./db');

async function getAllCategories() {
  const [rows] = await db.query('SELECT * FROM categories');
  return rows;
}

module.exports = { getAllCategories };
