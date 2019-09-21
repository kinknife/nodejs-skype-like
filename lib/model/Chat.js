const mongoose = require('mongoose');

const chat = mongoose.Schema({
    users: Array,
    name: {type: String, default: ''},
    type: {type: String, default: 'one'},
    messages: { type : Array , "default" : [] },
    seen: { type: Object, default: {}}
});

/**
 *  each message in meassages example:
 *  {
 *      from: 'usera',
 *      to: 'userb',
 *      content: 'abc',
 *      status: 'sent|seen',
 *      type: 'text, file, image, link',
 *      timeCreated: new Date().now,
 *      seen: array of userId
 *  } 
 * 
 *  each seen in messages example:
 *  id: index
 */

const Chat = mongoose.model('Chat', chat);

Chat.find({user: 'a'})
module.exports = Chat;