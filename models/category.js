// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  title: {
    type: String,
    query: true
  }
});

const CategoryModule = mongoose.model('Categorys', CategorySchema);
module.exports = CategoryModule