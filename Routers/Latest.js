const express = require('express');
const router = express.Router();
const pool = require("../config/db");

router.get("/search", async (req, res) => {
  const { q: query } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const { rows } = await pool.query(`
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
        ORDER BY a.published_at DESC
        LIMIT 10
      ) AS latest_articles
      WHERE title ILIKE $1 OR content ILIKE $1
    `, [`%${query}%`]);

    res.json(rows);
  } catch (err) {
    console.error("Latest search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});




// Latest: latest 10 articles
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
      ORDER BY a.published_at DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching latest articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Latest Search: search within the latest 10 articles

module.exports = router;
