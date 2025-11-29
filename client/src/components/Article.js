import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

const Article = () => {
  const { section, id, slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        console.log("Fetching article:", section, id, slug);

        const url = slug
          ? `/api/articles/${section}/${id}/${slug}`
          : `/api/articles/${section}/${id}`;

        const res = await api.get(url);
        setArticle(res.data);
      } catch (error) {
        console.error("Error loading article:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [section, id, slug]);

  if (loading) return <p>Loading article...</p>;
  if (!article) return <p>Article not found.</p>;

  return (
    <div className="article-page">
      <h1>{article.title}</h1>
      <div className="article-meta">
        <span>{new Date(article.published_at).toLocaleString()}</span>
        <span>👁️ {article.views}</span>
        <span className="tag">{article.section_name}</span>
      </div>

      {article.image && (
        <img
          src={
            article.image.startsWith("http")
              ? article.image
              : `/images/${article.image}`
          }
          alt={article.title}
          className="article-image"
        />
      )}

      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
};

export default Article;
