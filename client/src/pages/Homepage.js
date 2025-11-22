import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../App.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch articles whenever debouncedQuery OR selectedCategory changes
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint;

        // Search with optional category
        if (debouncedQuery.trim()) {
          // Trending & Latest have separate endpoints
          if (selectedCategory === 'Trending') {
            endpoint = `/api/articles/trending/search?q=${encodeURIComponent(
              debouncedQuery
            )}`;
          } else if (selectedCategory === 'Latest') {
            endpoint = `/api/articles/latest/search?q=${encodeURIComponent(
              debouncedQuery
            )}`;
          } else {
            const categoryParam =
              selectedCategory === 'All'
                ? ''
                : `&category=${selectedCategory.toLowerCase()}`;
            endpoint = `/api/articles/search?q=${encodeURIComponent(
              debouncedQuery
            )}${categoryParam}`;
          }
        } else {
          // No search query: fetch by section
          if (selectedCategory === 'Trending') {
            endpoint = `/api/articles/trending`;
          } else if (selectedCategory === 'Latest') {
            endpoint = `/api/articles/latest`;
          } else {
            const section = selectedCategory === 'All' ? 'all' : selectedCategory.toLowerCase();
            endpoint = `/api/articles/${section}`;
          }
        }

        const res = await api.get(endpoint);
        setArticles(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching articles:', err.response?.data || err.message);
        setError('Failed to fetch articles.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [debouncedQuery, selectedCategory]);

  // Trigger search immediately (button or Enter key)
  const handleSearch = () => {
    setDebouncedQuery(searchQuery);
  };

  return (
    <div className="homepage">
      <header className="header">
        <h1>The Flying Arrow</h1>
        <p>World's Finest News Source</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for absurd headlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Search articles"
          />
          <button onClick={handleSearch} aria-label="Submit search">
            Search
          </button>
        </div>
      </header>

      <nav className="categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
            aria-label={`Filter by ${category}`}
          >
            {category}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {loading ? (
          <p>Loading articles...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : articles.length === 0 ? (
          <p>No articles found.</p>
        ) : (
          <section className="articles">
            {articles.map((article) => (
              <article
                key={article.id}
                className="article-card"
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  navigate(
                    `/${article.section_name?.toLowerCase() || 'general'}/${article.id}`
                  )
                }
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  navigate(
                    `/${article.section_name?.toLowerCase() || 'general'}/${article.id}`
                  )
                }
              >
                {article.image && (
                  <img
                    src={
                      article.image.startsWith('http')
                        ? article.image
                        : `/images/${article.image}`
                    }
                    alt={article.title || 'Article'}
                    loading="lazy"
                  />
                )}

                <div className="article-content">
                  <h2>{article.title || 'Untitled Article'}</h2>
                  <p>{article.content?.slice(0, 120) || 'No content available.'}...</p>

                  <div className="article-meta">
                    <span className="date">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString()
                        : 'Unknown date'}
                    </span>
                    <span className="views">👁️ {article.views ?? 0}</span>
                    <span className="category-tag">{article.section_name || 'General'}</span>
                    {article.author_name && <span className="author">{article.author_name}</span>}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 The Flying Arrow. All rights reserved. Satire is our middle name.</p>
      </footer>
    </div>
  );
};

export default HomePage;
