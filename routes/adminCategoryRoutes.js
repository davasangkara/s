const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware proteksi login
function isAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect('/admin/login');
  next();
}

// Tampilkan semua kategori
router.get('/', isAdmin, async (req, res) => {
  const [categories] = await db.query(`
    SELECT 
      c.*,
      COUNT(p.id) AS total_produk,
      IFNULL(SUM(p.price), 0) AS total_harga,
      ROUND(IFNULL(AVG(p.rate), 0), 2) AS rata_rate
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.id DESC
  `);

  res.render('admin/categories', {
    title: 'Manajemen Kategori',
    categories
  });
});


// Tampilkan form tambah
router.get('/tambah', isAdmin, (req, res) => {
  res.render('admin/kategori-form', { title: 'Tambah Kategori', category: null });
});

// Simpan kategori baru
router.post('/tambah', isAdmin, async (req, res) => {
  const { name, slug } = req.body;
  await db.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
  res.redirect('/admin/kategori');
});

// Edit kategori
router.get('/edit/:id', isAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.redirect('/admin/kategori');
  res.render('admin/kategori-form', { title: 'Edit Kategori', category: rows[0] });
});

// Update kategori
router.post('/edit/:id', isAdmin, async (req, res) => {
  const { name, slug } = req.body;
  await db.query('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, req.params.id]);
  res.redirect('/admin/kategori');
});

// Hapus kategori
router.get('/hapus/:id', isAdmin, async (req, res) => {
  await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.redirect('/admin/kategori');
});

module.exports = router;
