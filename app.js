// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Routers
const publicRoutes        = require('./routes/publicRoutes');
const adminRoutes         = require('./routes/adminRoutes');          // berisi /admin/login, /admin/dashboard, dll
const adminCategoryRoutes = require('./routes/adminCategoryRoutes');  // fitur
const adminProductRoutes  = require('./routes/adminProductRoutes');   // fitur
const adminGestunRoutes   = require('./routes/adminGestunRoutes');    // fitur
const adminPulsaRoutes    = require('./routes/adminPulsaRoutes');     // fitur
const adminVoucherRoutes  = require('./routes/adminVoucherRoutes');   // fitur

const app = express();

// Penting di lingkungan HTTPS (Render, Nginx, dll)
app.set('trust proxy', 1);

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
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // true di produksi (HTTPS)
    maxAge: 1000 * 60 * 60 * 12, // 12 jam
  }
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

/* ---------- Guard admin fitur (kecuali /admin/login di adminRoutes) ---------- */
function requireLogin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    const nextUrl = encodeURIComponent(req.originalUrl || '/admin/dashboard');
    return res.redirect(`/admin/login?next=${nextUrl}`);
  }
  next();
}

/* ---------- Routes ---------- */
// Public
app.use('/', publicRoutes);
app.get('/tentang', (req, res) =>
  res.render('public/tentang', { title: 'Tentang Kami' })
);

// Admin core (punya halaman login & dashboard sendiri)
app.use('/admin', adminRoutes);

// Debug siapa saya (cek session cepat)
app.get('/admin/whoami', (req, res) => {
  res.json({
    adminId: req.session?.adminId || null,
    admin: req.session?.admin || null,
  });
});

// Admin features (wajib login)
app.use('/admin/kategori', requireLogin, adminCategoryRoutes);
app.use('/admin/produk',   requireLogin, adminProductRoutes);
app.use('/admin/gestun',   requireLogin, adminGestunRoutes);
app.use('/admin/pulsa',    requireLogin, adminPulsaRoutes);
app.use('/admin/voucher',  requireLogin, adminVoucherRoutes);

/* ---------- Aliases untuk URL lama ---------- */
app.get('/admin/gestun/providers', (req, res) => res.redirect(301, '/admin/gestun'));
app.get('/admin/rate-pulsa',       (req, res) => res.redirect(301, '/admin/pulsa'));
app.get('/admin/vouchers',         (req, res) => res.redirect(301, '/admin/voucher'));

/* ---------- 404 (harus satu, sebelum error handler) ---------- */
app.use((req, res) => {
  res.status(404);
  try {
    return res.render('errors/404', {
      title: 'Halaman tidak ditemukan',
      url: req.originalUrl
    });
  } catch (e) {
    return res.type('text').send('404 Not Found');
  }
});

/* ---------- Error handler (harus satu, paling terakhir) ---------- */
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
