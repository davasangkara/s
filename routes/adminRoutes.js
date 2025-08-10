// routes/adminRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../models/db'); // <- pastikan ini export pool mysql2/promise

// ======================= CONFIG / NAMA TABEL =======================
const TBL = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  GESTUN: 'gestun_providers',    // id, name, rate_pct, ...
  PULSA: 'pulsa_rates',          // id, provider, rate_pct, ...
  VOUCHERS: 'voucher_rates',     // id, type(FNB/GAME), brand, discount_pct, ...
  ADMIN_USERS: 'admin_users',
  ADMIN_LOGS: 'admin_logs',
};

// ======================= AUTH MIDDLEWARE =======================
function requireLogin(req, res, next) {
  if (!req.session || !req.session.adminId) return res.redirect('/admin/login');
  next();
}

// ======================= LOGGING UTIL =======================
async function logAction(req, action, entity, entity_id, meta = null) {
  try {
    await db.query(
      `INSERT INTO ${TBL.ADMIN_LOGS} (admin_id, action, entity, entity_id, meta)
       VALUES (?, ?, ?, ?, ?)`,
      [req.session.adminId || null, action, entity, entity_id || null, meta ? JSON.stringify(meta) : null]
    );
  } catch (e) { console.error('logAction error:', e.message); }
}

// ======================= GLOBAL LOCALS =======================
router.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// ======================= LOGIN =======================
router.get('/login', (req, res) => {
  res.render('admin/login', { title: 'Login Admin', error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(`SELECT * FROM ${TBL.ADMIN_USERS} WHERE username = ?`, [username]);
    if (!rows.length) {
      return res.render('admin/login', { title: 'Login Admin', error: 'Username tidak ditemukan' });
    }
    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.render('admin/login', { title: 'Login Admin', error: 'Password salah' });
    }

    req.session.adminId = admin.id;
    req.session.admin = { id: admin.id, username: admin.username };
    await logAction(req, 'login', 'session', admin.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/login', { title: 'Login Admin', error: 'Terjadi kesalahan saat login' });
  }
});

// ======================= LOGOUT =======================
router.get('/logout', requireLogin, async (req, res) => {
  try { await logAction(req, 'logout', 'session', req.session.adminId); } catch(e){}
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
});

// ======================= DASHBOARD =======================
// akses via /admin dan /admin/dashboard
router.get(['/', '/dashboard'], requireLogin, async (req, res, next) => {
  try {
    // Ambil semua KPI paralel
    const [
      [[{ total_kategori }]],
      [[{ total_produk }]],
      [[{ total_provider_gestun }]],
      [[{ total_rate_pulsa }]],
      [[{ total_voucher_fnb }]],
      [[{ total_voucher_game }]],
      [rowsPerKat],
      [logs],
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total_kategori FROM ${TBL.CATEGORIES}`),
      db.query(`SELECT COUNT(*) AS total_produk   FROM ${TBL.PRODUCTS}`),
      db.query(`SELECT COUNT(*) AS total_provider_gestun FROM ${TBL.GESTUN}`),
      db.query(`SELECT COUNT(*) AS total_rate_pulsa FROM ${TBL.PULSA}`),
      db.query(`SELECT COUNT(*) AS total_voucher_fnb  FROM ${TBL.VOUCHERS} WHERE type='FNB'`),
      db.query(`SELECT COUNT(*) AS total_voucher_game FROM ${TBL.VOUCHERS} WHERE type='GAME'`),
      db.query(`
        SELECT c.name AS kategori, COUNT(p.id) AS jumlah
        FROM ${TBL.CATEGORIES} c
        LEFT JOIN ${TBL.PRODUCTS} p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY jumlah DESC, c.name ASC
      `),
      db.query(`
        SELECT l.*, u.username
        FROM ${TBL.ADMIN_LOGS} l
        LEFT JOIN ${TBL.ADMIN_USERS} u ON u.id = l.admin_id
        ORDER BY l.id DESC
        LIMIT 10
      `),
    ]);

    // bentukkan array untuk chart kategori
    const produkPerKategori = rowsPerKat.map(r => ({
      kategori: r.kategori,
      jumlah: Number(r.jumlah || 0)
    }));

    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      admin: req.session.admin,

      // KPI untuk cards
      total_kategori:        Number(total_kategori || 0),
      total_produk:          Number(total_produk || 0),
      total_provider_gestun: Number(total_provider_gestun || 0),
      total_rate_pulsa:      Number(total_rate_pulsa || 0),
      total_voucher_fnb:     Number(total_voucher_fnb || 0),
      total_voucher_game:    Number(total_voucher_game || 0),

      // Chart "Jumlah Produk per Kategori"
      produkPerKategori,

      // Log aktivitas
      logs,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// ======================= QUICK ADD KATEGORI =======================
router.post('/kategori/quick', requireLogin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.redirect('/admin/dashboard');

  const slug = name.toString().trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'')
    .replace(/\s+/g,'-')
    .replace(/-+/g,'-');

  try {
    const [r] = await db.query(
      `INSERT INTO ${TBL.CATEGORIES} (name, slug) VALUES (?, ?)`,
      [name.trim(), slug]
    );
    await logAction(req, 'create', 'category', r.insertId, { name, slug });
    res.redirect('/admin/dashboard');
  } catch(e) {
    console.error(e);
    res.redirect('/admin/dashboard');
  }
});

// ======================= EXPORT PRODUK CSV =======================
router.get('/export/products.csv', requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.name, c.name AS category, p.price, p.rate, p.is_active, p.created_at
      FROM ${TBL.PRODUCTS} p
      LEFT JOIN ${TBL.CATEGORIES} c ON c.id = p.category_id
      ORDER BY p.id DESC
    `);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');

    res.write('id,name,category,price,rate,is_active,created_at\n');
    for (const r of rows) {
      const line = [
        r.id,
        `"${String(r.name).replace(/"/g,'""')}"`,
        `"${String(r.category||'').replace(/"/g,'""')}"`,
        r.price,
        r.rate,
        r.is_active,
        r.created_at ? new Date(r.created_at).toISOString() : ''
      ].join(',') + '\n';
      res.write(line);
    }
    await logAction(req, 'export', 'product', null, { count: rows.length });
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).send('Gagal membuat CSV');
  }
});

// ======================= PRODUK (CRUD ringan) =======================
router.get('/produk', requireLogin, async (req, res) => {
  const [products] = await db.query(`
    SELECT p.*, c.name AS category_name
    FROM ${TBL.PRODUCTS} p
    LEFT JOIN ${TBL.CATEGORIES} c ON p.category_id = c.id
    ORDER BY p.id DESC
  `);

  const formattedProducts = products.map(p => ({
    ...p,
    price_formatted: new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(p.price)
  }));

  const [categories] = await db.query(`SELECT * FROM ${TBL.CATEGORIES} ORDER BY name`);

  res.render('admin/products', {
    title: 'Manajemen Produk',
    products: formattedProducts,
    categories
  });
});

// Tambah (GET)
router.get('/produk/edit/0', requireLogin, async (req, res) => {
  const [categories] = await db.query(`SELECT * FROM ${TBL.CATEGORIES} ORDER BY name`);
  res.render('admin/product-form', {
    title: 'Tambah Produk',
    action: '/admin/produk/edit/0',
    product: null,
    categories
  });
});

// Tambah (POST)
router.post('/produk/edit/0', requireLogin, async (req, res) => {
  const { name, category_id, price, rate, is_active } = req.body;
  const active = is_active ? 1 : 0;
  const [r] = await db.query(
    `INSERT INTO ${TBL.PRODUCTS} (name, category_id, price, rate, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [name, category_id, price, rate, active]
  );
  // await logAction(req, 'create', 'product', r.insertId, { name });
  res.redirect('/admin/produk');
});

// Edit (GET)
router.get('/produk/edit/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const [[product]] = await db.query(`SELECT * FROM ${TBL.PRODUCTS} WHERE id = ?`, [id]);
  if (!product) return res.status(404).send('Produk tidak ditemukan');

  const [categories] = await db.query(`SELECT * FROM ${TBL.CATEGORIES} ORDER BY name`);

  res.render('admin/product-form', {
    title: 'Edit Produk',
    action: `/admin/produk/edit/${id}`,
    product,
    categories
  });
});

// Edit (POST)
router.post('/produk/edit/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { name, category_id, price, rate, is_active } = req.body;
  const active = is_active ? 1 : 0;

  await db.query(
    `UPDATE ${TBL.PRODUCTS}
     SET name = ?, category_id = ?, price = ?, rate = ?, is_active = ?
     WHERE id = ?`,
    [name, category_id, price, rate, active, id]
  );
  // await logAction(req, 'update', 'product', id, { name });
  res.redirect('/admin/produk');
});

// Hapus produk (POST)
router.post('/produk/delete/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  await db.query(`DELETE FROM ${TBL.PRODUCTS} WHERE id = ?`, [id]);
  // await logAction(req, 'delete', 'product', id);
  res.redirect('/admin/produk');
});

// Hapus kategori (POST) aman (cek masih dipakai)
router.post('/kategori/delete/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  try {
    const [[{ cnt }]] = await db.query(
      `SELECT COUNT(*) AS cnt FROM ${TBL.PRODUCTS} WHERE category_id = ?`,
      [id]
    );
    if (cnt > 0) {
      return res.redirect('/admin/kategori?error=masih_dipakai&count=' + cnt);
    }
    await db.query(`DELETE FROM ${TBL.CATEGORIES} WHERE id = ?`, [id]);
    res.redirect('/admin/kategori?deleted=1');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/kategori?error=delete_failed');
  }
});

// ======================= LOGS PAGE (opsional) =======================
router.get('/logs', requireLogin, async (req,res)=>{
  const [rows] = await db.query(`
    SELECT l.*, u.username
    FROM ${TBL.ADMIN_LOGS} l
    LEFT JOIN ${TBL.ADMIN_USERS} u ON u.id = l.admin_id
    ORDER BY l.id DESC
    LIMIT 100
  `);
  res.render('admin/logs', { title: 'Log Aktivitas', admin: req.session.admin, logs: rows });
});

module.exports = router;
