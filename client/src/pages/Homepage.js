import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../App.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("latest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Added for login status

  const navigate = useNavigate();

  // Category list
  const categories = [
    'All',
    'News',
    'Politics',
    'Trending',
    'Entertainment',
    'Latest',
    'Sports',
    'Horoscope',
  ];

  // Auto-highlight active category pill while scrolling
  const categoryRefs = useRef({});

 /* useEffect(() => {
    const handleScroll = () => {
      let closest = 'All';
      let minDistance = Infinity;

      Object.entries(categoryRefs.current).forEach(([cat, ref]) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const dist = Math.abs(rect.top);
        if (dist < minDistance) {
          closest = cat;
          minDistance = dist;
        }
      });

      setSelectedCategory(closest);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);*/

  // Detect login on load (added)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Articles (pagination + search + category + sorting)
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = "";
        const limit = 12;

        if (debouncedQuery.trim()) {
          // Search endpoint
          let scope = "all";
          if (selectedCategory === "Trending") scope = "trending";
          if (selectedCategory === "Latest") scope = "latest";

          const categoryParam =
            selectedCategory !== "All" &&
            selectedCategory !== "Trending" &&
            selectedCategory !== "Latest"
              ? `&category=${selectedCategory.toLowerCase()}`
              : "";
          
          endpoint = `/api/articles/search?q=${encodeURIComponent(
            debouncedQuery
          )}&scope=${scope}${categoryParam}`;
        } else {
          // Category-based endpoint
          if (selectedCategory === "Trending") {
            endpoint = `/api/articles/trending`;
          } else if (selectedCategory === "Latest") {
            endpoint = `/api/articles/latest?page=${page}&limit=${limit}&sort=${sort}`;
          } else {
            const section = selectedCategory === "All" ? "all" : selectedCategory.toLowerCase();
            endpoint = `/api/articles/${section}?page=${page}&limit=${limit}&sort=${sort}`;
          }
        }

        const res = await api.get(endpoint);

        setArticles(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [debouncedQuery, selectedCategory, page, sort]);

  const handleSearch = () => {
    setDebouncedQuery(searchQuery);
    setPage(1);
  };

  const goToNextPage = () => setPage((p) => p + 1);
  const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));

  // Logout handler (added)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("author");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="homepage">
      <header className="header">
        <div className="header-top">
          <div className="title-container">
            <img src="/Logo.png" alt="The Flying Arrow Logo" className="logo" />
            <h1>The Flying Arrow</h1>
          </div>
          <button onClick={() => window.location.href = "/auth/X74b8Ajk8301"} className="test-login-btn">Test Login</button>
        </div>
        <p>World's Finest News Source</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for absurd headlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {/* Show logout only when logged in (added) */}
        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      <nav className="categories">
        {categories.map((category) => (
          <button
            key={category}
            ref={(el) => (categoryRefs.current[category] = el)}
            className={`category-button ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => {
              setSelectedCategory(category);
              setPage(1);
            }}
          >
            {category}
          </button>
        ))}
      </nav>

      {/* Sorting */}
      <div className="sorting-controls">
        <label>Sort:</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="views">Most Viewed</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
      </div>

      <main className="main-content">
        {loading ? (
          <p>Loading articles...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : articles.length === 0 ? (
          <p>No articles found.</p>
        ) : (
          <section className="articles">
            {articles.map((article) => (
              <article
                key={article.id}
                className="article-card"
                onClick={() =>
                  navigate(
                    `/${article.section_name?.toLowerCase()}/${article.id}/${article.slug}`
                  )
                }
              >
                {article.image && (
                  <img
                    src={
                      article.image.startsWith("http")
                        ? article.image
                        : `/images/${article.image}`
                    }
                    alt={article.title}
                    loading="lazy"
                  />
                )}

                <div className="article-content">
                  <h2>{article.title}</h2>
                  <p>{article.content?.slice(0, 120)}...</p>

                  <div className="article-meta">
                    <span>
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                    <span>👁️ {article.views}</span>
                    <span className="category-tag">
                      {article.section_name}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={goToPreviousPage}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={goToNextPage}>Next</button>
      </div>

      <footer className="footer">
        <p>&copy; 2026 The Flying Arrow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;