// Routers/Entertainment.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // make sure this path is correct

router.get('/', async (req, res) => {
    const dbCheck = await pool.query('SELECT current_database();');
    console.log('Connected to database:', dbCheck.rows[0].current_database);
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.id, 
        a.title, 
        a.slug, 
        a.content, 
        a.image, 
        a.published_at,
        au.name AS author_name, 
        s.name AS section_name
      FROM public.articles a
      JOIN public.authors au ON a.author_id = au.id
      JOIN public.sections s ON a.section_id = s.id
      WHERE s.slug = 'entertainment'
      ORDER BY a.published_at DESC;
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching entertainment articles:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
