// Routers/Trending.js
const express = require('express');
const router = express.Router();
const pool = require("../config/db");

router.get("/search", async (req, res) => {
  const { q: query } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const sql = `
      SELECT *
      FROM (
        SELECT 
          a.id,
          a.title,
          a.content,
          a.image,
          a.published_at,
          a.views,
          au.name AS author_name,
          s.name AS section_name,
          s.slug AS section_slug
        FROM articles a
        JOIN authors au ON a.author_id = au.id
        JOIN sections s ON a.section_id = s.id
        WHERE a.published_at >= NOW() - INTERVAL '7 days'
        ORDER BY a.views DESC
      ) AS trending_articles
      WHERE title ILIKE $1 OR content ILIKE $1
      LIMIT 10
    `;

    const params = [`%${query}%`];
    const { rows } = await pool.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error("Error searching trending articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Trending: highest views in last 7 days


router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.image,
        a.published_at,
        a.views,
        au.name AS author_name,
        s.name AS section_name,
        s.slug AS section_slug
      FROM articles a
      JOIN authors au ON a.author_id = au.id
      JOIN sections s ON a.section_id = s.id
      WHERE a.published_at >= NOW() - INTERVAL '7 days'
      ORDER BY a.views DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching trending articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
