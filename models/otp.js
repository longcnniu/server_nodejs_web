// Using Node.js `require()`
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OTPSchema = new Schema({
    email: {
        type: String,
        query: true
    },
    OTP: {
        type: String,
        query: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
});

const OTPModule = mongoose.model('OTP', OTPSchema);
module.exports = OTPModule