// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    idUser: {
        type: String,
    },
    idPost: {
        type: String,
    },
    comment: {
        type: String,
    },
    createDateComment: {
        type: Date,
        default: Date.now
    }
});

const CommentModule = mongoose.model('Comment', CommentSchema);
module.exports = CommentModule