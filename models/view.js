// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ViewsSchema = new Schema({
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

const ViewsModule = mongoose.model('Views', ViewsSchema);
module.exports = ViewsModule