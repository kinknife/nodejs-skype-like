const mongoose = require('mongoose');
const userSession = new mongoose.Schema({
    _id: {
        type: String
    },
    userId: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
});

const UserSession = mongoose.model('session', userSession);

module.exports = UserSession;