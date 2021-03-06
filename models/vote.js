// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const VotesSchema = new Schema({
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

const VotesModule = mongoose.model('Votes', VotesSchema);
module.exports = VotesModule