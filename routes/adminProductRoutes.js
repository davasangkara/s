const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware proteksi admin
function isAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect('/admin/login');
  next();
}

// Daftar produk
router.get('/', isAdmin, async (req, res) => {
  const [products] = await db.query(`
    SELECT products.*, categories.name AS category_name
    FROM products
    JOIN categories ON products.category_id = categories.id
    ORDER BY products.id DESC
  `);
  res.render('admin/products', { title: 'Manajemen Produk', products });
});

// Form tambah
router.get('/tambah', isAdmin, async (req, res) => {
  const [categories] = await db.query('SELECT * FROM categories');
  res.render('admin/product-form', { title: 'Tambah Produk', product: null, categories });
});

// Proses tambah
router.post('/tambah', isAdmin, async (req, res) => {
  const { category_id, name, rate, description, is_active } = req.body;
  await db.query(`
    INSERT INTO products (category_id, name, rate, description, is_active)
    VALUES (?, ?, ?, ?, ?)
  `, [category_id, name, rate, description, is_active ? 1 : 0]);
  res.redirect('/admin/produk');
});

// Form edit
router.get('/edit/:id', isAdmin, async (req, res) => {
  const [[product]] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  const [categories] = await db.query('SELECT * FROM categories');
  res.render('admin/product-form', { title: 'Edit Produk', product, categories });
});

// Proses update
router.post('/edit/:id', isAdmin, async (req, res) => {
  const { category_id, name, rate, description, is_active } = req.body;
  await db.query(`
    UPDATE products SET category_id = ?, name = ?, rate = ?, description = ?, is_active = ?
    WHERE id = ?
  `, [category_id, name, rate, description, is_active ? 1 : 0, req.params.id]);
  res.redirect('/admin/produk');
});

// Hapus produk
router.get('/hapus/:id', isAdmin, async (req, res) => {
  await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.redirect('/admin/produk');
});



module.exports = router;
