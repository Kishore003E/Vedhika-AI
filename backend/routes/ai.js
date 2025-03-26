// const express = require('express');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config();

// const router = express.Router();
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// // Summarize Article
// router.post('/summarize', async (req, res) => {
//   try {
//     const { content } = req.body;
//     const prompt = `Summarize this article in 3-5 bullet points:\n\n${content}`;

//     const response = await model.generateContent(prompt);
//     const summary = response.response.text();

//     res.json({ summary });
//   } catch (error) {
//     console.error('Error summarizing:', error);
//     res.status(500).json({ error: 'Failed to summarize article' });
//   }
// });

// // Analyze Sentiment
// router.post('/sentiment', async (req, res) => {
//   try {
//     const { content } = req.body;
//     const prompt = `Analyze the sentiment of this news article. Reply with one word: Positive, Negative, or Neutral.\n\n${content}`;

//     const response = await model.generateContent(prompt);
//     const sentiment = response.response.text().trim();

//     res.json({ sentiment });
//   } catch (error) {
//     console.error('Error analyzing sentiment:', error);
//     res.status(500).json({ error: 'Failed to analyze sentiment' });
//   }
// });

// module.exports = router;



const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Article = require('../models/Article');
require('dotenv').config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Summarize Article
router.post('/summarize', async (req, res) => {
  try {
    const { content } = req.body;
    const prompt = `Summarize this article in 3-5 bullet points:\n\n${content}`;

    const response = await model.generateContent(prompt);
    const summary = response.response.text();

    res.json({ summary });
  } catch (error) {
    console.error('Error summarizing:', error);
    res.status(500).json({ error: 'Failed to summarize article' });
  }
});

// Analyze Sentiment
router.post('/sentiment', async (req, res) => {
  try {
    const { content } = req.body;
    const prompt = `Analyze the sentiment of this news article. Reply with one word: Positive, Negative, or Neutral.\n\n${content}`;

    const response = await model.generateContent(prompt);
    const sentiment = response.response.text().trim();

    res.json({ sentiment });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// Categorize an article
async function categorizeArticle(title, description) {
  try {
    const prompt = `
      Based on this article title and description, classify it into ONE of the following categories:
      Technology, Business, Science, Health, Entertainment, Sports, Politics, Environment, Education.
      Return only the category name, nothing else.
      
      Title: ${title}
      Description: ${description || "No description available"}
    `;

    const result = await model.generateContent(prompt);
    const category = result.response.text().trim();
    
    return category;
  } catch (error) {
    console.error('Error categorizing article:', error);
    return 'Uncategorized';
  }
}

// Get user interests based on saved articles
router.get('/interests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's saved articles
    const savedArticles = await Article.find({ userId });
    
    if (savedArticles.length === 0) {
      return res.json([]);
    }
    
    // Check if articles need categorization
    const uncategorizedArticles = savedArticles.filter(article => !article.category);
    
    // Categorize uncategorized articles
    for (const article of uncategorizedArticles) {
      const category = await categorizeArticle(article.title, article.description);
      
      // Update article with category
      await Article.findByIdAndUpdate(
        article._id,
        { category },
        { new: true }
      );
      
      // Add category to our local copy
      article.category = category;
    }
    
    // Count category occurrences
    const categoryCount = {};
    
    savedArticles.forEach(article => {
      const category = article.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Convert to array and calculate percentages
    const totalArticles = savedArticles.length;
    const interests = Object.entries(categoryCount)
      .map(([categoryName, count]) => ({
        categoryName,
        count,
        percentage: Math.round((count / totalArticles) * 100)
      }))
      .sort((a, b) => b.count - a.count);
    
    res.json(interests);
  } catch (error) {
    console.error('Error analyzing interests:', error);
    res.status(500).json({ error: 'Failed to analyze interests' });
  }
});

// Get recommended articles based on user interests
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's saved articles
    const savedArticles = await Article.find({ userId });
    
    if (savedArticles.length === 0) {
      return res.json({ interests: [], recommendations: [] });
    }
    
    // Ensure all articles have categories
    const uncategorizedArticles = savedArticles.filter(article => !article.category);
    
    for (const article of uncategorizedArticles) {
      const category = await categorizeArticle(article.title, article.description);
      
      // Update article with category
      await Article.findByIdAndUpdate(
        article._id,
        { category },
        { new: true }
      );
      
      // Add category to our local copy
      article.category = category;
    }
    
    // Count category occurrences
    const categoryCount = {};
    
    savedArticles.forEach(article => {
      const category = article.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Get top 3 interests
    const totalArticles = savedArticles.length;
    const interests = Object.entries(categoryCount)
      .map(([categoryName, count]) => ({
        categoryName,
        count,
        percentage: Math.round((count / totalArticles) * 100)
      }))
      .sort((a, b) => b.count - a.count);
    
    const topInterests = interests.slice(0, 3).map(interest => interest.categoryName);
    
    // Find articles from other users in the same categories
    const recommendations = await Article.find({
      userId: { $ne: userId }, // Not the current user's articles
      category: { $in: topInterests } // Matching the user's interests
    })
    .sort({ date: -1 }) // Most recent first
    .limit(10);
    
    res.json({ 
      interests: interests, 
      recommendations: recommendations 
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;