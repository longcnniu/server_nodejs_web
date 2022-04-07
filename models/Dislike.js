// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DisLikeSchema = new Schema({
    UserId: {
        type: String,
        query: true
    },
    PostId: {
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
});

const DisLikeModule = mongoose.model('DisLike', DisLikeSchema);
module.exports = DisLikeModule