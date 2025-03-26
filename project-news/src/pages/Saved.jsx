import React, { useState, useEffect } from 'react';

const Saved = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loadingSummaries, setLoadingSummaries] = useState({});
  const [loadingSentiments, setLoadingSentiments] = useState({});

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/saved/user123`);
      const data = await response.json();
      setSavedArticles(data);
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    }
  };

  const summarizeArticle = async (articleId, content) => {
    setLoadingSummaries((prev) => ({ ...prev, [articleId]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      setSavedArticles(savedArticles.map(article =>
        article._id === articleId ? { ...article, summary: data.summary } : article
      ));
    } catch (error) {
      console.error('Error summarizing article:', error);
    } finally {
      setLoadingSummaries((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  const analyzeSentiment = async (articleId, content) => {
    setLoadingSentiments((prev) => ({ ...prev, [articleId]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/ai/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      setSavedArticles(savedArticles.map(article =>
        article._id === articleId ? { ...article, sentiment: data.sentiment } : article
      ));
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setLoadingSentiments((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  // Delete Article from MongoDB
  const handleRemoveArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetch(`http://localhost:5000/api/articles/remove/${articleId}`, { method: 'DELETE' });
      setSavedArticles(savedArticles.filter(article => article._id !== articleId));
    } catch (error) {
      console.error('Error removing article:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Saved Articles</h1>
      
      {savedArticles.length === 0 ? (
        <p className="text-center text-gray-500">No saved articles yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArticles.map(article => (
            <div 
              key={article._id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:scale-105"
            >
              {/* Image Section */}
              <div className="h-48 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Title */}
                <h2 className="text-lg font-bold mb-2">{article.title}</h2>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.description}</p>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-between items-center mt-auto">
                  
                  {/* Summarize Button */}
                  <button 
                    onClick={() => summarizeArticle(article._id, article.description)}
                    disabled={loadingSummaries[article._id]}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded-md hover:bg-yellow-700 transition"
                  >
                    {loadingSummaries[article._id] ? 'Summarizing...' : 'Summarize'}
                  </button>

                  {/* Sentiment Button */}
                  <button 
                    onClick={() => analyzeSentiment(article._id, article.description)}
                    disabled={loadingSentiments[article._id]}
                    className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-md hover:bg-purple-700 transition"
                  >
                    {loadingSentiments[article._id] ? 'Analyzing...' : 'Analyze Sentiment'}
                  </button>

                  {/* Delete Button */}
                  <button 
                    onClick={() => handleRemoveArticle(article._id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </div>

                {/* Summary Display */}
                {article.summary && (
                  <p className="text-gray-700 mt-3 text-sm"><b>Summary:</b> {article.summary}</p>
                )}

                {/* Sentiment Display */}
                {article.sentiment && (
                  <p className={`mt-2 text-sm font-semibold ${
                    article.sentiment === 'Positive' ? 'text-green-600' 
                    : article.sentiment === 'Negative' ? 'text-red-600' 
                    : 'text-gray-600'
                  }`}>
                    <b>Sentiment:</b> {article.sentiment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;