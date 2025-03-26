import React, { useState, useEffect } from 'react';
import image1 from '../assets/download.jpeg';

const API_KEY = '904f4fac2f564b48a438e728665b103c'; // Replace with your actual API Key
const BASE_URL = 'https://newsapi.org/v2/top-headlines?country=us';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readArticles, setReadArticles] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);

  const categories = ['All', 'Technology', 'Business', 'Science', 'Health', 'Entertainment', 'Sports'];

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  // Filter articles whenever search term or articles change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article => 
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchTerm, articles]);

  const fetchNews = async (category) => {
    setLoading(true);
    try {
      const url = category === 'All' 
        ? `${BASE_URL}&apiKey=${API_KEY}`
        : `${BASE_URL}&category=${category.toLowerCase()}&apiKey=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.articles) {
        setArticles(data.articles);
        setFilteredArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to Save Articles in MongoDB
  const saveArticle = async (article) => {
    try {
      const response = await fetch('http://localhost:5000/api/articles/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description || 'No description available',
          image: article.urlToImage || image1,
          source: article.source.name,
          date: article.publishedAt,
          userId: 'user123' 
        })
      });

      const data = await response.json();
      alert(data.message); // Show a message when saved
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  // Toggle Read/Unread State
  const toggleReadStatus = (articleTitle) => {
    setReadArticles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(articleTitle)) {
        newSet.delete(articleTitle); // Mark as Unread
      } else {
        newSet.add(articleTitle); // Mark as Read
      }
      return newSet;
    });
  };

  // Truncate text to a specific length
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search news by title, description, or source..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
        </div>
      )}

      {/* News Grid - Smaller Cards & More Space */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {/* Image Container with Fixed Height */}
              <div className="h-40 overflow-hidden">
                <img 
                  src={article.urlToImage || image1} 
                  alt={article.title} 
                  className="w-full h-full object-cover rounded-t-lg"
                  onError={(e) => { e.target.onerror = null; e.target.src = image1; }} 
                />
              </div>

              {/* Content Container */}
              <div className="p-3 flex flex-col flex-grow">
                {/* Date and Actions */}
                <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    {/* Mark as Read Button */}
                    <button 
                      onClick={() => toggleReadStatus(article.title)}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        readArticles.has(article.title) 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {readArticles.has(article.title) ? 'Read' : 'Mark as Read'}
                    </button>

                    {/* Save Article Button */}
                    <button 
                      onClick={() => saveArticle(article)}
                      className="text-gray-500 hover:text-blue-600 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-md font-bold mb-1">{truncateText(article.title, 60)}</h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-2">{truncateText(article.description, 120)}</p>

                {/* Source and Read More */}
                <div className="flex justify-between items-center mt-auto text-xs">
                  <span className="text-gray-500">{truncateText(article.source.name, 20)}</span>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Read more
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="col-span-full text-center text-gray-500">
            {searchTerm ? "No results found for your search." : "No news available in this category."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;