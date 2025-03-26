import React, { useEffect, useState } from "react";

const API_KEY = "f0624a4daa9a47f886605970e6f309c4"; // Replace with your API Key
const API_URL = `https://newsapi.org/v2/top-headlines?country=india&apiKey=${API_KEY}`;

const NewsList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setArticles(data.articles); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <p>Loading news...</p>;

  return (
    <div className="news-container">
      {articles.map((article, index) => (
        <div key={index} className="news-card">
          <img src={article.urlToImage} alt="news" className="news-image" />
          <h3>{article.title}</h3>
          <p>{article.description}</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        </div>
      ))}
    </div>
  );
};

export default NewsList;
