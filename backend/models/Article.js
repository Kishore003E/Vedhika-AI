const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  source: String,
  date: String,
  userId: String,
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Article', ArticleSchema);
