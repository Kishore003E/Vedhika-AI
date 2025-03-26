const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); 

// Get all saved articles for a user
router.get('/saved/:userId', async (req, res) => {
  try {
    const articles = await Article.find({ userId: req.params.userId });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching saved articles' });
  }
});

// Save an article
router.post('/save', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json({ message: 'Article saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving article' });
  }
});

// Delete an article
router.delete('/remove/:id', async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article removed' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting article' });
  }
});

module.exports = router;