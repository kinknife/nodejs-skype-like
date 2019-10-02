const io = require('socket.io-client');
const ss = require('socket.io-stream');

class Connections {
    constructor() {
        this.chatCb = null;
        this.queue = [];
        let socket;
        if (process.env.REACT_APP_ENV !== "production") {
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
        this.socket.emit('mapId', { id: id });
    }

    sendChat(chatId, chat) {
        this.socket.emit('chat', { chatId, chat });
    }

    getChat(id, index) {
        this.socket.emit('getChat', { id: id, index: index });
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
        this.socket.emit('friendRequest', { newMess, name: name });
    }

    updateChatCb(cb) {
        this.chatCb = cb
    }

    acceptRequest(userId, acceptedId) {
        this.socket.emit('accept', { userId, acceptedId });
    }

    uploadFile(file, path, to, from) {
        let newUpload = {
            from: from,
            to: to,
            files: []
        }

        if (this.queue.length !== 0) {
            if (file.length > 1) {
                newUpload.files = Array.prototype.slice.call(file).slice(1);
            } else {
                newUpload.files.push(file);
            }
            return;
        }

        let uploadFile = file[0];
        if (file.length > 1) {
            newUpload.files = Array.prototype.slice.call(file).slice(1);
        } else {
            newUpload.files.push(file[0]);
        }

        let newMess = this.addUpload(uploadFile, from, to, path);

        this.queue.push(newUpload);
        let stream = ss.createStream();
        ss(this.socket).emit('upload', stream, { size: uploadFile.size, name: uploadFile.name, path: path });
        this.socket.on('uploadSucceed', (data) => {
            newMess.content.path = data.path;
            delete newMess.file;
            this.sendChat(path, newMess);
            this.updateUpload(0, newMess, path);
        });
        let readStream = ss.createBlobReadStream(uploadFile);
        readStream.on('data', chunk => {
            this.updateUpload(chunk, newMess, path);
        });
        readStream.pipe(stream);
    }

    addUpload(uploadFile, from, to, path) {
        let type = 'file';
        if(uploadFile.type.includes('image')) {
            type = 'image';
        }

        if(uploadFile.type.includes('video')) {
            type = 'video';
        }
        
        let newMess = {
            from: from,
            to: to,
            content: {
                fileName: uploadFile.name,
                size: uploadFile.size
            },
            status: 'sending',
            file: uploadFile,
            seen: [],
            type: type,
            uploaded: 0,
            timeCreate: new Date()
        }
        this.chatCb([{
            id: path,
            messages: newMess,
            type: 'new'
        }]);
        return newMess;
    }

    updateUpload(chunk, newMess, id) {
        newMess.uploaded += chunk.length;
        this.chatCb([
            {
                type: 'update',
                id: id,
                messages: [newMess]
            }
        ]);
    }
};

export let connections = new Connections();