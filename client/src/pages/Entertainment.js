import React, { useState, useEffect } from 'react';
import api from '../api/api';
import '../App.css';

const Entertainment = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/entertainment')
      .then(res => {
        console.log('Fetched entertainment articles:', res.data);
        setArticles(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('Error fetching entertainment articles:', err);
        setError('Failed to load articles.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="homepage">
      <header className="header">
        <h1>Entertainment News</h1>
      </header>

      <main className="main-content">
        <section className="articles">
          {loading && <p>Loading entertainment articles...</p>}
          {error && <p>{error}</p>}
          {!loading && !error && articles.length === 0 && <p>No entertainment articles found.</p>}
          {!loading && !error && articles.map(article => (
            <article key={article.id} className="article-card">
              {article.image && (
                <img
                  src={article.image.startsWith('http') ? article.image : `/images/${article.image}`}
                  alt={article.title}
                />
              )}
              <div className="article-content">
                <h2>{article.title || 'Untitled Article'}</h2>
                <p>{article.content || 'No content available.'}</p>
                <span className="date">
                  {article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}
                </span>
                <span className="category-tag">{article.section_name || 'Entertainment'}</span>
                {article.author_name && <span className="author">{article.author_name}</span>}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Entertainment;
