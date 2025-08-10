const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req,res,next)=>{
  try{
    const [rows] = await db.query('SELECT id,type,brand,discount_pct FROM voucher_rates ORDER BY type, brand ASC');
    res.render('admin/voucher/index', { title:'Voucher', rates: rows });
  }catch(e){ next(e); }
});

router.get('/new', (req,res)=> res.render('admin/voucher/form', { title:'Tambah Voucher', item:null }));
router.post('/new', async (req,res,next)=>{
  try{
    const { type, brand, discount_pct } = req.body;
    await db.query('INSERT INTO voucher_rates (type, brand, discount_pct) VALUES (?,?,?)',[type, brand, discount_pct]);
    res.redirect('/admin/voucher');
  }catch(e){ next(e); }
});

router.get('/edit/:id', async (req,res,next)=>{
  try{
    const [r] = await db.query('SELECT * FROM voucher_rates WHERE id=?',[req.params.id]);
    res.render('admin/voucher/form', { title:'Edit Voucher', item:r[0]||null });
  }catch(e){ next(e); }
});
router.post('/edit/:id', async (req,res,next)=>{
  try{
    const { type, brand, discount_pct } = req.body;
    await db.query('UPDATE voucher_rates SET type=?, brand=?, discount_pct=? WHERE id=?',[type, brand, discount_pct, req.params.id]);
    res.redirect('/admin/voucher');
  }catch(e){ next(e); }
});

router.post('/delete/:id', async (req,res,next)=>{
  try{
    await db.query('DELETE FROM voucher_rates WHERE id=?',[req.params.id]);
    res.redirect('/admin/voucher');
  }catch(e){ next(e); }
});

module.exports = router;
