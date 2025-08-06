const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminCategoryRoutes = require('./routes/adminCategoryRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');

const app = express();

// ✅ Middleware untuk parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Static files (gunakan sekali saja)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'convert-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // ubah ke true jika pakai HTTPS
}));

// ✅ View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/kategori', adminCategoryRoutes);
app.use('/admin/produk', adminProductRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
