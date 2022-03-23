// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  title: {
    type: String,
    query: true
  },
  createDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    query: true
  },
  lockDate: {
    type: Date,
    query: true
  }
});

const CategoryModule = mongoose.model('Categorys', CategorySchema);
module.exports = CategoryModule