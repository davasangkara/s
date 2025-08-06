const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../models/db');

// Middleware auth
function requireLogin(req, res, next) {
  if (!req.session.adminId) return res.redirect('/admin/login');
  next();
}

// Middleware: global untuk layout aktif
router.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// ================= LOGIN =================
router.get('/login', (req, res) => {
  res.render('admin/login', { title: 'Login Admin', error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (!rows.length)
      return res.render('admin/login', { title: 'Login Admin', error: 'Username tidak ditemukan' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match)
      return res.render('admin/login', { title: 'Login Admin', error: 'Password salah' });

    req.session.adminId = admin.id;
    req.session.admin = admin;

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/login', { title: 'Login Admin', error: 'Terjadi kesalahan saat login' });
  }
});

// ================= DASHBOARD =================
router.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const [[{ total_kategori }]] = await db.query('SELECT COUNT(*) AS total_kategori FROM categories');
    const [[{ total_produk }]] = await db.query('SELECT COUNT(*) AS total_produk FROM products');
    const [produkPerKategori] = await db.query(`
      SELECT c.name AS kategori, COUNT(p.id) AS jumlah
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
    `);

    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      admin: req.session.admin,
      total_kategori,
      total_produk,
      produkPerKategori
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal memuat dashboard');
  }
});

// ================= PRODUK =================
router.get('/produk', requireLogin, async (req, res) => {
  const [products] = await db.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `);

  const formattedProducts = products.map(p => ({
    ...p,
    price_formatted: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(p.price)
  }));

  const [categories] = await db.query('SELECT * FROM categories ORDER BY name');

  res.render('admin/products', {
    title: 'Manajemen Produk',
    products: formattedProducts,
    categories
  });
});

// ================= PRODUK FORM (TAMBAH & EDIT) =================
router.get('/produk/edit/0', requireLogin, async (req, res) => {
  const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
  res.render('admin/product-form', {
    title: 'Tambah Produk',
    action: '/admin/produk/edit/0',
    product: null,
    categories
  });
});

router.post('/produk/edit/0', requireLogin, async (req, res) => {
  const { name, category_id, price, rate, is_active } = req.body;
  await db.query(
    'INSERT INTO products (name, category_id, price, rate, is_active) VALUES (?, ?, ?, ?, ?)',
    [name, category_id, price, rate, is_active ? 1 : 0]
  );
  res.redirect('/admin/produk');
});

router.get('/produk/edit/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const [[product]] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
  if (!product) return res.status(404).send('Produk tidak ditemukan');

  res.render('admin/product-form', {
    title: 'Edit Produk',
    action: `/admin/produk/edit/${id}`,
    product,
    categories
  });
});

router.post('/produk/edit/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { name, category_id, price, rate, is_active } = req.body;
  await db.query(
    'UPDATE products SET name = ?, category_id = ?, price = ?, rate = ?, is_active = ? WHERE id = ?',
    [name, category_id, price, rate, is_active ? 1 : 0, id]
  );
  res.redirect('/admin/produk');
});

router.post('/produk/delete/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM products WHERE id = ?', [id]);
  res.redirect('/admin/produk');
});


module.exports = router;
