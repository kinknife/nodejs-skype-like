const io = require('socket.io-client');
const ss = require('socket.io-stream');

class Connections {
    constructor() {
        this.chatCb = null;
        this.queue = [];
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
            this.socket.on('uploadSucceed', (data) => {
                console.log(data);
                this.queue = this.queue.slice(1);
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

    uploadFile(file, path) {
        if(this.queue.length !== 0) {
            if(file.constructor === Array) {
                this.queue.concat(file);
            } else {
                this.queue.push(file);
            }
            return;
        }
        let uploadFile = file[0];
        if(file.length > 1) {
            this.queue = Array.prototype.slice.call(file).slice(1);
        } else {
            this.queue.push(file[0]);
        }
        let stream = ss.createStream();
        ss(this.socket).emit('upload', stream, {size: uploadFile.size, name: uploadFile.name, path: path});
        ss.createBlobReadStream(uploadFile).pipe(stream);
    }
};

export let connections = new Connections();