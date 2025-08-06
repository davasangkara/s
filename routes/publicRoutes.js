const express = require('express');
const router = express.Router();
const { getAllCategories } = require('../models/categoryModel');
const db = require('../models/db');
const { body, validationResult } = require('express-validator');

// 🏠 Halaman Beranda
router.get('/', async (req, res) => {
  const categories = await getAllCategories();

  const [rows] = await db.query(`
    SELECT 
      p.*, 
      c.name AS category_name, 
      c.slug AS category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
    ORDER BY p.id DESC
  `);

  const produkPerKategori = {};
  rows.forEach(row => {
    if (!produkPerKategori[row.category_slug]) {
      produkPerKategori[row.category_slug] = {
        category_name: row.category_name,
        products: []
      };
    }
    produkPerKategori[row.category_slug].products.push(row);
  });

  const [latestProducts] = await db.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
    ORDER BY p.id DESC
    LIMIT 6
  `);

  const [popularProducts] = await db.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
    ORDER BY p.rate DESC
    LIMIT 6
  `);

  const [[stats]] = await db.query(`
    SELECT 
      COUNT(*) AS total_products,
      ROUND(AVG(rate), 1) AS avg_rate
    FROM products
    WHERE is_active = 1
  `);

  const bannerPromo = {
    title: "🔥 Flash Sale Premium!",
    desc: "Nikmati diskon hingga 70% untuk produk pilihan minggu ini!",
    cta: "Belanja Sekarang",
    link: "/kategori/promo",
    image: "/images/promo-banner.jpg"
  };

  res.render('public/index', {
    title: 'Beranda',
    categories,
    produkPerKategori,
    latestProducts,
    popularProducts,
    stats,
    bannerPromo
  });
});

// 📂 Halaman Kategori Dinamis
router.get('/kategori/:slug', async (req, res) => {
  const slug = req.params.slug;
  const [[category]] = await db.query('SELECT * FROM categories WHERE slug = ?', [slug]);
  if (!category) return res.status(404).send('Kategori tidak ditemukan');

  const [products] = await db.query(`
    SELECT * FROM products
    WHERE category_id = ? AND is_active = 1
    ORDER BY id DESC
  `, [category.id]);

  const categories = await getAllCategories();

  res.render('public/kategori', {
    title: category.name,
    category,
    products,
    categories
  });
});


module.exports = router;
