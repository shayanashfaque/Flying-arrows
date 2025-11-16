import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // your axios instance
import '../App.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  const categories = ['All', 'News', 'Politics', 'Trending', 'Entertainment', 'Latest', 'Sports'];

  useEffect(() => {
    api.get('/')
      .then(res => {
        console.log('Fetched articles:', res.data); // debug
        setArticles(Array.isArray(res.data) ? res.data : []); // safety check
      })
      .catch(err => console.error('Error fetching articles:', err));
  }, []);

  // Filter safely
  const filteredArticles = Array.isArray(articles)
    ? articles.filter(article => {
        const title = article.title || '';
        const content = article.content || '';
        const section = article.section_name || '';
        const matchesSearch =
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || section === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

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
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button onClick={() => {}}>Search</button>
        </div>
      </header>

      <nav className="categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(category);
              if (category === 'Entertainment') navigate('/entertainment');
            }}
          >
            {category}
          </button>
        ))}
      </nav>

      <main className="main-content">
        <section className="articles">
          {filteredArticles.length === 0 ? (
            <p>No articles found.</p>
          ) : (
            filteredArticles.map(article => (
              <article key={article.id} className="article-card">
                {article.image && (
                  <img
                    src={article.image.startsWith('http') ? article.image : `/images/${article.image}`}
                    alt={article.title || 'Article'}
                  />
                )}
                <div className="article-content">
                  <h2>{article.title || 'Untitled Article'}</h2>
                  <p>{article.content || 'No content available.'}</p>
                  <span className="date">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}
                  </span>
                  <span className="category-tag">{article.section_name || 'General'}</span>
                  {article.author_name && <span className="author">{article.author_name}</span>}
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 The Flying Arrow. All rights reserved. Satire is our middle name.</p>
      </footer>
    </div>
  );
};

export default HomePage;
