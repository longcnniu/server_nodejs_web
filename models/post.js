// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostsSchema = new Schema({
  UserId: {
    type: String,
    query: true
  },
  name: {
    type: String,
    query: true
  },
  dateCreate: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    query: true
  },
  content: {
    type: String,
    query: true
  },
  category: {
    type: String,
    query: true
  },
  Like: {
    type: Number,
    query: true,
    default: 0
  },
  DisLike: {
    type: Number,
    query: true,
    default: 0
  },
  numberView: {
    type: Number,
    query: true,
    default: 0
  },
  lockPost: {
    type: Boolean,
    query: true,
    default: false
  },
  endTime1: {
    type: Boolean,
    query: true,
    default: false
  },
  NameImg: {
    type: String,
    query: true,
  },
  TyFile: {
    type: String,
    query: true,
  },
  Department: {
    type: String,
    query: true
  },
  isReview: {
    type: Boolean,
    query: true,
    default: false
  }
});

const PostsModule = mongoose.model('Posts', PostsSchema);
module.exports = PostsModule