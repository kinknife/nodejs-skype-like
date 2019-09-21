const mongoose = require('mongoose');

let user = mongoose.Schema({
    email: String,
    password: String,
    name: {type: String, default: ''},
    status: String,
    lastOnline: Date,
    gender: {type: String, default: 'male'},
    chats: [{
        seen: Number,
        id: {
            type: mongoose.Schema.Types.ObjectId
        },
        chatRef: mongoose.Schema.Types.ObjectId
    }],
    pendings: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}]
});

let User = mongoose.model('user', user);

module.exports = User;