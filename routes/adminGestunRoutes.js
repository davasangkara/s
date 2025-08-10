const express = require('express');
const router = express.Router();
const db = require('../models/db'); // ganti sesuai punyamu

// list
router.get('/', async (req,res,next)=>{
  try{
    const [rows] = await db.query('SELECT id,name,rate_pct FROM gestun_providers ORDER BY name ASC');
    res.render('admin/gestun/index', { title:'Kelola Gestun', providers: rows });
  }catch(e){ next(e); }
});

// new
router.get('/new', (req,res)=> res.render('admin/gestun/form', { title:'Tambah Provider', item:null }));
router.post('/new', async (req,res,next)=>{
  try{
    const { name, rate_pct } = req.body;
    await db.query('INSERT INTO gestun_providers (name, rate_pct) VALUES (?,?)',[name, rate_pct]);
    res.redirect('/admin/gestun');
  }catch(e){ next(e); }
});

// edit
router.get('/edit/:id', async (req,res,next)=>{
  try{
    const [r] = await db.query('SELECT * FROM gestun_providers WHERE id=?',[req.params.id]);
    res.render('admin/gestun/form', { title:'Edit Provider', item: r[0] || null });
  }catch(e){ next(e); }
});
router.post('/edit/:id', async (req,res,next)=>{
  try{
    const { name, rate_pct } = req.body;
    await db.query('UPDATE gestun_providers SET name=?, rate_pct=? WHERE id=?',[name, rate_pct, req.params.id]);
    res.redirect('/admin/gestun');
  }catch(e){ next(e); }
});

// delete
router.post('/delete/:id', async (req,res,next)=>{
  try{
    await db.query('DELETE FROM gestun_providers WHERE id=?',[req.params.id]);
    res.redirect('/admin/gestun');
  }catch(e){ next(e); }
});

module.exports = router;
