// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    idUser: {
        type: String,
        query: true
    },
    idPost: {
        type: String,
        query: true
    },
    comment: {
        type: String,
        query: true
    },
    createDateComment: {
        type: Date,
        default: Date.now
    },
    name: {
        type:String,
        query: true
    }
});

const CommentModule = mongoose.model('Comment', CommentSchema);
module.exports = CommentModule