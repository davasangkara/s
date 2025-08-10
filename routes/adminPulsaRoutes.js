const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req,res,next)=>{
  try{
    const [rows] = await db.query('SELECT id,provider,rate_pct FROM pulsa_rates ORDER BY provider ASC');
    res.render('admin/pulsa/index', { title:'Rate Pulsa', rates: rows });
  }catch(e){ next(e); }
});

router.get('/new', (req,res)=> res.render('admin/pulsa/form', { title:'Tambah Rate Pulsa', item:null }));
router.post('/new', async (req,res,next)=>{
  try{
    const { provider, rate_pct } = req.body;
    await db.query('INSERT INTO pulsa_rates (provider, rate_pct) VALUES (?,?)',[provider, rate_pct]);
    res.redirect('/admin/pulsa');
  }catch(e){ next(e); }
});

router.get('/edit/:id', async (req,res,next)=>{
  try{
    const [r] = await db.query('SELECT * FROM pulsa_rates WHERE id=?',[req.params.id]);
    res.render('admin/pulsa/form', { title:'Edit Rate Pulsa', item:r[0]||null });
  }catch(e){ next(e); }
});
router.post('/edit/:id', async (req,res,next)=>{
  try{
    const { provider, rate_pct } = req.body;
    await db.query('UPDATE pulsa_rates SET provider=?, rate_pct=? WHERE id=?',[provider, rate_pct, req.params.id]);
    res.redirect('/admin/pulsa');
  }catch(e){ next(e); }
});

router.post('/delete/:id', async (req,res,next)=>{
  try{
    await db.query('DELETE FROM pulsa_rates WHERE id=?',[req.params.id]);
    res.redirect('/admin/pulsa');
  }catch(e){ next(e); }
});

module.exports = router;
