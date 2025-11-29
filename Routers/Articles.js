const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const slugify = require("slugify");

// ---------------------
// Trending Cache Setup
// ---------------------
let trendingCache = {
  data: null,
  timestamp: 0
};
const TRENDING_CACHE_DURATION = 60 * 1000; // 60 seconds

// ---------------------
// Helper: Fetch Article by ID, Section & Slug
// ---------------------
async function handleArticleRequest(section, id, slug, res) {
  const sectionSlug = section.toLowerCase();

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        a.id,
        a.title,
        a.slug,
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
      WHERE s.slug = $1 AND a.id = $2 AND a.slug = $3
      LIMIT 1
      `,
      [sectionSlug, id, slug]
    );

    if (!rows[0]) return res.status(404).json({ error: "Article not found" });

    // Increment views
    await pool.query(`UPDATE articles SET views = views + 1 WHERE id = $1`, [id]);

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ---------------------
// Universal Search Route
// ---------------------
router.get("/search", async (req, res) => {
  const { q: query, category, page = 1, limit = 12, sort = "latest" } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const params = [`%${query}%`];
    let whereClauses = [`(a.title ILIKE $1 OR a.content ILIKE $1 OR t.name ILIKE $1)`];

    if (category && category.toLowerCase() !== "all") {
      whereClauses.push(`s.slug = $${params.length + 1}`);
      params.push(category.toLowerCase());
    }

    let sql = `
      SELECT DISTINCT
        a.id,
        a.title,
        a.slug,
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
      WHERE ${whereClauses.join(" AND ")}
    `;

    let orderBy = "a.published_at DESC";
    if (sort === "oldest") orderBy = "a.published_at ASC";
    else if (sort === "views") orderBy = "a.views DESC";
    else if (sort === "az") orderBy = "a.title ASC";
    else if (sort === "za") orderBy = "a.title DESC";

    sql += ` ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------
// All Articles with Pagination & Sorting
// ---------------------
router.get("/all", async (req, res) => {
  const { page = 1, limit = 12, sort = "latest" } = req.query;

  try {
    let orderBy = "a.published_at DESC";
    if (sort === "oldest") orderBy = "a.published_at ASC";
    else if (sort === "views") orderBy = "a.views DESC";
    else if (sort === "az") orderBy = "a.title ASC";
    else if (sort === "za") orderBy = "a.title DESC";

    const { rows } = await pool.query(
      `
      SELECT 
        a.id, a.title, a.slug, a.content, a.image, a.published_at, a.views,
        au.name AS author_name, s.name AS section_name, s.slug AS section_slug
      FROM articles a
      JOIN authors au ON a.author_id = au.id
      JOIN sections s ON a.section_id = s.id
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
      `,
      [limit, (page - 1) * limit]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching all articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------
// Trending Articles (Cached)
// ---------------------
router.get("/trending", async (req, res) => {
  const now = Date.now();
  if (trendingCache.data && now - trendingCache.timestamp < TRENDING_CACHE_DURATION) {
    return res.json(trendingCache.data);
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        a.id, a.title, a.slug, a.content, a.image, a.published_at, a.views,
        au.name AS author_name, s.name AS section_name, s.slug AS section_slug
      FROM articles a
      JOIN authors au ON a.author_id = au.id
      JOIN sections s ON a.section_id = s.id
      WHERE a.is_trending = TRUE
      ORDER BY a.views DESC
      LIMIT 10
      `
    );

    trendingCache = { data: rows, timestamp: Date.now() };
    res.json(rows);
  } catch (err) {
    console.error("Error fetching trending articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------
// Latest Articles
// ---------------------
router.get("/latest", async (req, res) => {
  const { page = 1, limit = 12, sort = "latest" } = req.query;

  try {
    let orderBy = "a.published_at DESC";
    if (sort === "oldest") orderBy = "a.published_at ASC";
    else if (sort === "views") orderBy = "a.views DESC";
    else if (sort === "az") orderBy = "a.title ASC";
    else if (sort === "za") orderBy = "a.title DESC";

    const { rows } = await pool.query(
      `
      SELECT 
        a.id, a.title, a.slug, a.content, a.image, a.published_at, a.views,
        au.name AS author_name, s.name AS section_name, s.slug AS section_slug
      FROM articles a
      JOIN authors au ON a.author_id = au.id
      JOIN sections s ON a.section_id = s.id
      WHERE a.is_latest = TRUE
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
      `,
      [limit, (page - 1) * limit]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching latest articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------
// Articles by Section
// ---------------------
router.get("/:section", async (req, res) => {
  const { section } = req.params;
  const { page = 1, limit = 12, sort = "latest" } = req.query;

  try {
    let orderBy = "a.published_at DESC";
    if (sort === "oldest") orderBy = "a.published_at ASC";
    else if (sort === "views") orderBy = "a.views DESC";
    else if (sort === "az") orderBy = "a.title ASC";
    else if (sort === "za") orderBy = "a.title DESC";

    const { rows } = await pool.query(
      `
      SELECT 
        a.id, a.title, a.slug, a.content, a.image, a.published_at, a.views,
        au.name AS author_name, s.name AS section_name, s.slug AS section_slug
      FROM articles a
      JOIN authors au ON a.author_id = au.id
      JOIN sections s ON a.section_id = s.id
      WHERE s.slug = $1
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
      `,
      [section.toLowerCase(), limit, (page - 1) * limit]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching section articles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------
// Single Article by Section, ID & Slug
// ---------------------
router.get("/:section/:id/:slug", async (req, res) => {
  const { section, id, slug } = req.params;
  handleArticleRequest(section, id, slug, res);
});

// ---------------------
// Single Article by Section & ID (slug optional)
// ---------------------
router.get("/:section/:id", async (req, res) => {
  const { section, id } = req.params;
  handleArticleRequest(section, id, null, res);
});

module.exports = router;
