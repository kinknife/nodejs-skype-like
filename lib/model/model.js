const Chat = require('./Chat.js');
const User = require('./User');
const Session = require('./Session');
const async = require('async');

class Model {
    
    findMatchingUser(string, cb) {
        User.find({$or: [
            {email:  { "$regex": string, "$options": "i" } },
            {name: { "$regex": string, "$options": "i" }}
        ]}, (err, doc) => {
            cb(err, doc);
        });
    }

    findUser(email, cb) {
        User.find({email: email}, '_id password', (err, data) => {
            cb(err, data);
        });
    }

    getUserInfo(id, cb) {
        async.parallel({
            user: (done) => {
                User.findById(id).populate('friends').populate('pendings')
                    .exec((err, data) => {
                        if(err) {
                            return done(err);
                        }
                        done(null, data);
                    });
            },
            chats: (done) => {
                Chat.aggregate([
                    {$match: {users: id}},
                    {$project: {
                        'messages': {
                            $slice: ['$messages', {
                                $max: [
                                    20,
                                    {$add: 
                                        [{$subtract: [
                                            {$size: 
                                                {$filter: {
                                                    input: '$messages',
                                                    as: 'message',
                                                    cond: {$in: [id, '$$message.seen']}
                                                }}
                                            },
                                            {$size: '$messages'}
                                        ]},
                                        10]
                                    }
                                ]
                            }]
                        }
                    }}
                ]).then((data, err) => {
                    if(err) {
                        return done(err);
                    }
                    done(null, data);
                });
            }
        }, (err, result) => {
            if(err) {
                console.log(err);
                return cb(err);
            }
            let user = Object.assign({}, result.user._doc);
            for(let chat of user.chats) {
                let mergeChat = result.chats.find(el => el._id.toString() === chat.id.toString());
                let tempChat = Object.assign({}, mergeChat);
                let newChat = Object.assign({}, chat)._doc;
                Object.assign(newChat, tempChat);
                Object.assign(chat, newChat);
            }
            cb(null, user);
        });
    }

    findUserById(id, cb) {
        User.findById(id, (err, doc) => {
            cb(err, doc);
        })
    }

    updateFriend(id1, id2) {
        User.findById(id1, (err, user) => {
            let index = user.pendings.indexOf(id2);
            user.pendings.splice(index, 1);
            user.friends.push(id2);
            user.save((err, doc) => {
            });
        });
        User.findById(id2, (err, user) => {
            let index = user.pendings.indexOf(id1);
            user.pendings.splice(index, 1);
            user.friends.push(id1);
            user.save((err, doc) => {
            });
        });
    }

    createUser(user, cb) {
        let newUser = new User({
            email: user.email,
            name: user.name,
            password: user.password,
            status: 'online'
        });

        newUser.save((err, doc) => {
            cb(err, doc);
        });
    }

    updateUser(user, cb) {
        let id = user.id;
        User.findById(id, (err, data) => {
            if (err) {
                cb(err);
                return;
            }
            if (!data) {
                cb('no user with id');
                return;
            }
            for(let each in user) {
                data[each] = user[each];
            }
            data.save((err, doc) => { cb(err, doc) });
        });
    }

    deleteUser(id, cb) {
        User.findByIdAndDelete(id, cb);
    }

    addChatToUser(id, chat) {
        User.findById(id, (err, data) => {
            if (err) {
                return;
            }
            if (!data) {
                return;
            }
            data.chats.push(chat);
            data.save((err, doc) => { if(err){console.log(err)} });
        });
    }

    createSession(session, cb) {
        let newSession = new Session({
            _id: session.id,
            userId: session.userId
        });

        newSession.save((err, doc) => {
            cb(err, doc);
        })
    }
    
    getSessionById(id, cb) {
        Session.findById(id, (err, data) => {
            cb(err, data);
        })
    }

    deleteSession(id, cb) {
        Session.findByIdAndDelete(id, (err, data) => {cb(err, data)});
    }

    updateSession(id, newId, cb) {
        this.deleteSession(id, (err, data) => {
            if (err) {
                cb(err);
                return;
            }
            if (!data) {
                cb('no user with id');
                return;
            }
            let newSession = new Session({
                _id: newId,
                userId: data.userId
            })
            newSession.save((err, doc) => { cb(err, doc) });
        })
    }

    createChat(chats, name, type, users, cb) {
        let seen = {};
        seen[users[0]] = chats.length - 1;
        let newChat = new Chat({
            users: users,
            name: name,
            type: type,
            messages: chats,
            seen: seen
        });

        newChat.save((err, doc) => {
            cb(err, doc)
        });
    }

    updateChat(id, chats, cb) {
        Chat.findById(id, (err, data) => {
            if (err) {
                cb(err);
                return;
            }
            if (!data) {
                cb('no user with id');
                return;
            }
            data.messages.push(chats);
            data.save((err, doc) => { cb(err, doc) });
        });
    }

    removeMessage(id, message, cb) {
        Chat.findById(id, (err, data) => {
            if (err) {
                cb(err);
                return;
            }
            if (!data) {
                cb('no user with id');
                return;
            }
            let index = data.messages.find(el => el.timeCreated === message.timeCreated);
            data.messages.splice(index, 1);
            data.save((err) => { cb(err) });
        });
    }

    deleteChat(id, cb) {
        Chat.findByIdAndDelete(id, cb);
    }

    getChat(id, start, number, cb) {
        Chat.aggregate([
            {
                $match: { _id: id }
            },
            {
                $project: {
                    messages: {
                        $slice: ['$messages', start, number]
                    }
                }
            }
        ], (err, doc) => {
            cb(err, doc);
        });
    }
}

module.exports = Model;