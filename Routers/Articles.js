const express = require("express");
const router = express.Router();
const pool = require("../config/db");


router.get("/search", async (req, res) => {
  const { q: query, category } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    let sql = `
      SELECT DISTINCT
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
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE (a.title ILIKE $1 OR a.content ILIKE $1 OR t.name ILIKE $1)
    `;

    const params = [`%${query}%`];

    // Optional category filter
    if (category && category.toLowerCase() !== "all") {
      sql += ` AND s.slug = $2`;
      params.push(category.toLowerCase());
    }

    sql += ` ORDER BY a.published_at DESC`;

    console.log("Search query:", query);
    console.log("Category:", category);
    console.log("SQL params:", params);

    const { rows } = await pool.query(sql, params);

    console.log("Rows returned:", rows.length);
    res.json(rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// NEW: Route to fetch ALL articles (for "All" category)
router.get("/all", async (req, res) => {
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
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching all articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/trending", async (req, res) => {
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
    console.log("Trending articles returned:", rows.length);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching trending articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});




router.get("/:section", async (req, res) => {
  const sectionSlug = req.params.section.toLowerCase();
  

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
      WHERE LOWER(s.slug) = $1
      ORDER BY a.published_at DESC
    `, [sectionSlug]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching section articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Existing route: GET single article
router.get("/:section/:id", async (req, res) => {
  const { section, id } = req.params;

  // Normalize section slug
  const sectionSlug = section.toLowerCase();

  try {
    // Increase view count
    await pool.query(
      `UPDATE articles SET views = views + 1 WHERE id = $1`,
      [id]
    );

    // Fetch article
    const { rows } = await pool.query(
      `
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
      WHERE s.slug = $1 
        AND a.id = $2
      LIMIT 1
      `,
      [sectionSlug, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});





module.exports = router;
