import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ArticlePage = () => {
  const { section, id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!section || !id) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/articles/${section}/${id}`);
        if (!res.ok) throw new Error("Article not found");

        const data = await res.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [section, id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!article) return <p>No article data</p>;

  return (
    <div className="article-page">
      <h1>{article.title || "Untitled"}</h1>
      <p>
        <strong>By:</strong> {article.author_name || "Unknown"} &nbsp;|&nbsp;
        <strong>Published:</strong> {article.published_at || "Unknown"}
      </p>
      {article.image ? (
        <img src={article.image} alt={article.title} />
      ) : (
        <div>No image</div>
      )}
      <div>{article.content || "No content available."}</div>
    </div>
  );
};

export default ArticlePage;
