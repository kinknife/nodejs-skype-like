const modelTemp = require('./model/model.js');
const { getKeyByValue } = require('./libs/utils.js');

const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const uuid = require('rand-token');
const app = express();
const server = require('http').Server(app);
const socketIo = require('socket.io')(server);


app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '../'));
app.use(express.static(path.join(__dirname, '../dist')));

async function run() {
    // message load pertime
    const maxLoad = 20;

    // Data base connect
    const configure = JSON.parse(await fs.readFile(path.join(__dirname, 'config.json')));
    mongoose.connect(`mongodb+srv://${configure.userName}:${configure.password}@cluster0-tz68d.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true });
    // model init
    const model = new modelTemp();

    const socketMapping = {};

    server.listen(4200, () => {
        console.log('App is listening at port 4200');
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist', 'product.html'));
    });
    
    app.post('/login', (req, res) => {
        let user = req.body;
        model.findUser(user.email, (err, data) => {
            if(err) {
                res.status(500).send({succeed: false, err: err});
                return;
            }

            if(data.length === 0) {
                res.status(404).send({succeed: false, message: 'not found'});
                return;
            }
            if(data[0].password !== user.password) {
                res.status(203).send({succeed: false, message: 'wrong password or email'});
                return;
            }

            model.getUserInfo(data[0]._id, (err, user) => {
                if(err) {
                    return res.status(500).send({
                        succeed: false
                    });
                }
                model.createSession({userId: data[0]._id, id: uuid.generate(16)}, (err, doc) => {
                    if(err) {
                        console.log(err);
                        return res.status(500).send({
                            succeed: false,
                            err: err
                        });
                    }
    
                    res.status(200).send({
                        succeed: true,
                        user: user,
                        token: doc._id
                    });
                });
    
    
                model.updateUser({id: user._id, status: 'online'}, (err, doc) => {
                    if(err) {
                        console.log(err);
                    }
                })
            })

        });
    });

    app.post('/signup', (req, res) => {
        let user = req.body;
        if (!user.email) {
            return res.send({
                succeed: false,
                message: 'Error: email cannot be blank'
            });
        }

        if(!user.name) {
            return res.send({
                succeed: false,
                message: 'Error: name cannot be blank'
            });
        }

        if (!user.password) {
            return res.send({
                succeed: false,
                message: 'Error: password cannot be blank'
            });
        }
        
        model.findUser(user.email, (err, previousUser) => {
            if(err) {
                return res.status(500).send({
                    succeed: false
                });
            }
            if(previousUser.length > 0) {
                return res.send({
                    succeed: false,
                    message: 'Account already exist'
                });
            }

            model.createUser(user, (err, data) => {
                if (err) {
                    return res.status(500).send({
                        succeed: false
                    });
                };
                model.createSession({userId: data._id, id:uuid.generate(16)}, (err, doc) => {
                    if (err) {
                        return res.status(500).send({
                            succeed: false
                        });
                    }
                    return res.send({
                        succeed: true,
                        message: 'succeed',
                        token: doc._id,
                        user: data
                    });
                });
            });
        })
    });

    app.post('/token', (req, res) => {
       model.getSessionById(req.body.token, (err, doc) => {
            if(err) {
                console.log(err);
                return res.status(500).send({
                    succeed: false
                });
            }
            if(!doc) {
                return res.status(404).send({
                    succeed: false
                });
            }
            let newToken = uuid.generate(16);
            model.getUserInfo(doc.userId, (err, user) => {
                if(err) {
                    return res.status(500).send({
                        succeed: false
                    });
                }
                model.updateSession(req.body.token, newToken, (err, session) => {
                    if(err) {
                        console.log(err, req.body.token, 'updateSession');
                    } else {
                        res.status(200).send({
                            succeed: true,
                            user: user,
                            token: newToken
                        });
                    }
                });
    
    
                model.updateUser({id: user._id, status: 'online'}, (err, doc) => {
                    if(err) {
                        console.log(err);
                    }
                })
            })
       });
    });

    app.post('/revoke', (req, res) => {
        let token = req.body.token;
        model.deleteSession(token, (err, doc) => {
            if(err) {
                res.status(500).send({
                    succeed: false,
                    err: err
                });
            } else if(doc) {
                res.status(200).send({
                    succeed: true
                });
            }
        })
    })

    app.post('/suggest', (req, res) => {
        model.findMatchingUser(req.body.email, (err, doc) => {
            if(err) {
                res.status(500).send({
                    succeed: false,
                    err: err
                });
            }

            res.status(200).send({
                succeed: true,
                users: doc
            });
        });
    });

    app.post('/chat', (req, res) => {
        let {start, id} = req.body.index;
        model.getChat(id, start, maxLoad, (err, data) => {
            if(err) {
                res.status(500).send({
                    succeed: false,
                    err: err
                });
            }

            res.status(200).send({
                succeed: true,
                messages: data
            });
        });
    });

    socketIo.on('connection', (socket) => {

        socket.on('mapId', (data) => {
            let id = data.id;
            socketMapping[id] = socket.id;
        });

        socket.on('friendRequest', (data) => {
            let newMess = data.newMess;
            newMess.status = 'sent';
            let messages = [newMess];
            model.createChat(messages, data.name, 'one', [newMess.from, newMess.to], (err, doc) => {
                if(err) {
                } else {
                    let fromChat = {
                        seen: doc.messages.length - 1,
                        id: doc._id,
                        chatRef: newMess.to
                    };
                    model.addChatToUser(newMess.from, fromChat);
                    socket.emit('updateChats', [
                        {
                            type: 'update',
                            message: [newMess],
                            id: doc._id
                        }
                    ]);
                    
                    let toChat = {
                        seen: 0,
                        id: doc._id,
                        chatRef: newMess.from
                    };
                    model.addChatToUser(newMess.to, toChat);
                    let to = socketMapping[data.to];
                    socketIo.to(`${to}`).emit('updateChats', [
                        {
                            id: doc._id,
                            messages: [newMess]
                        }
                    ]);
                }
            });
        });

        socket.on('chat', (data) => {
            data.chat.status = 'sent';
            model.updateChat(data.chatId, data.chat, (err, doc) => {
                if(err) {
                    console.log(err);
                    return;
                }
                let to = socketMapping[data.chat.to];
                socketIo.to(`${to}`).emit('updateChats', [
                    {
                        id: doc._id,
                        messages: data.chat,
                        type: 'new'
                    }
                ]);
            });
        });

        socket.on('accept', (data) => {
            model.updateFriend(data.userId, data.acceptedId);
        });

        socket.on('disconnect', () => {
            model.updateUser({id: getKeyByValue(socketMapping, socket.id),status: 'offline', lastOnline: new Date()}, (err, doc) => {
            });
        });
    })
}

exports.run = run;