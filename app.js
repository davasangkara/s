// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Routers
const publicRoutes        = require('./routes/publicRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const adminCategoryRoutes = require('./routes/adminCategoryRoutes');
const adminProductRoutes  = require('./routes/adminProductRoutes');
const adminGestunRoutes   = require('./routes/adminGestunRoutes');
const adminPulsaRoutes    = require('./routes/adminPulsaRoutes');
const adminVoucherRoutes  = require('./routes/adminVoucherRoutes');

const app = express();

/* ---------- Core middleware ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (cukup sekali)
app.use(express.static(path.join(__dirname, 'public')));

// Session harus dipasang sebelum akses req.session di locals
app.use(session({
  secret: process.env.SESSION_SECRET || 'convert-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true jika pakai HTTPS + proxy
}));

// Locals untuk EJS
app.use((req, res, next) => {
  res.locals.admin = req.session?.admin || null;
  res.locals.currentPath = req.originalUrl || req.path || '';
  next();
});

/* ---------- View engine ---------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ---------- Routes ---------- */
// Public
app.use('/', publicRoutes);
app.get('/tentang', (req, res) =>
  res.render('public/tentang', { title: 'Tentang Kami' })
);

// Admin core
app.use('/admin', adminRoutes);

// Admin features
app.use('/admin/kategori', adminCategoryRoutes);
app.use('/admin/produk',   adminProductRoutes);
app.use('/admin/gestun',   adminGestunRoutes);   // /, /new, /edit/:id, /delete/:id
app.use('/admin/pulsa',    adminPulsaRoutes);    // /, /new, /edit/:id, /delete/:id
app.use('/admin/voucher',  adminVoucherRoutes);  // /, /new, /edit/:id, /delete/:id

/* ---------- Aliases untuk URL lama (biar link lama tetap jalan) ---------- */
app.get('/admin/gestun/providers', (req, res) => res.redirect(301, '/admin/gestun'));
app.get('/admin/rate-pulsa',       (req, res) => res.redirect(301, '/admin/pulsa'));
app.get('/admin/vouchers',         (req, res) => res.redirect(301, '/admin/voucher'));

/* ---------- 404 & Error handler ---------- */
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Halaman tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500).render('errors/500', { title: 'Terjadi kesalahan', error: err });
});

// 404
app.use((req, res) => {
  res.status(404);
  try { return res.render('errors/404', { title: 'Halaman tidak ditemukan', url: req.originalUrl }); }
  catch (e) { return res.type('text').send('404 Not Found'); }
});

// 500
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500);
  try {
    return res.render('errors/500', {
      title: 'Terjadi kesalahan',
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  } catch (e) {
    return res.type('text').send('Internal Server Error');
  }
});


/* ---------- Start ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
