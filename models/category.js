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
  },
  ischeckEndDate: {
    type: Boolean,
    query: true,
    default: false
  },
  ischecklLockDate: {
    type: Boolean,
    query: true,
    default: false
  }
});

const CategoryModule = mongoose.model('Categorys', CategorySchema);
module.exports = CategoryModule