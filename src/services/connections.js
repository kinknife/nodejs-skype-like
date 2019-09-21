const io = require('socket.io-client');

class Connections {
    constructor() {
        this.chatCb = null;
        let socket;
        if(process.env.REACT_APP_ENV !== "production") {
            socket = io(':4200/');
            this.server = 'http://localhost:4200'
        } else {
            socket = io('/');
            this.server = '';
        }

        socket.on('connect', () => {
            this.socket = socket;
            this.socket.on('updateChats', (data) => {
                this.chatCb(data);
            });
        });
    }

    sendMapping(id) {
        this.socket.emit('mapId', {id: id});
    }

    sendChat(chatId, chat) {
        this.socket.emit('chat', {chatId, chat});
    }

    getChat(id, index) {
        this.socket.emit('getChat', {id: id, index: index});
    }

    sendFriendRequest(fromId, toId, msg, name, type) {
        let newMess = {
            from: fromId,
            to: toId,
            content: msg,
            type: type,
            timeCreate: new Date(),
            status: 'sending',
            seen: []
        };
        this.socket.emit('friendRequest', {newMess, name: name});
    }

    updateChatCb(cb) {
        this.chatCb = cb
    }

    acceptRequest(userId, acceptedId) {
        this.socket.emit('accept', {userId, acceptedId});
    }
};

export let connections = new Connections();