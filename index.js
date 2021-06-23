'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ strict: true }));
app.enable('trust proxy');

const server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let roomMap = new Map();
let socketMap = new Map();

app.use('/cdn', (req, res) => {
    if (fs.existsSync(`./cdn${req.url}`)) {
        res.sendFile(path.join(__dirname + `/cdn${req.url}`));
    }
    else {
        res.status(404).send('Oops! I cannot find the file you specified!');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on("connection", (socket) => {
    socket.on('message', (content) => {
        if (content.token && content.msg) {
            jwt.verify(content.token, config.TOKEN_SECRET, (err, user) => {
                if (err) {
                    socket.broadcast.to(socket.id).emit('error', "JWT verification error");
                }
                else if (user.socket !== socket.id) {
                    socket.broadcast.to(socket.id).emit('error', "Invalid token for socket");
                }
                else {
                    let room = socketMap.get(socket.id).room;
                    roomMap.get(room).forEach(id => {
                        io.sockets.to(id).emit('message', { user: `${user.name}`, msg: content.msg });
                    });
                }
            })
        }
        else {
            io.sockets.to(socket.id).emit('error', "No token or message");
        }
    });
    socket.on('setname', (obj) => {
        if (obj.room && obj.name) {
            let token = jwt.sign({ name: obj.name, socket: socket.id }, config.TOKEN_SECRET);
            io.sockets.to(socket.id).emit('jwt', token);
            if (roomMap.has(obj.room)) {
                let newroom = roomMap.get(obj.room);
                newroom.push(socket.id);
                roomMap.set(obj.room, newroom);
                socketMap.set(socket.id, { room: obj.room, name: obj.name });
                roomMap.get(obj.room).forEach(id => {
                    io.sockets.to(id).emit('join', `${obj.name}`);
                });
            }
            else {
                if (/^[A-Za-z0-9]+$/.test(obj.room)) {
                    roomMap.set(obj.room, [socket.id]);
                    socketMap.set(socket.id, { room: obj.room, name: obj.name });
                    roomMap.get(obj.room).forEach(id => {
                        io.sockets.to(id).emit('join', `${obj.name}`);
                    });
                }
                else {
                    io.sockets.to(socket.id).emit('error', "Invalid room code");
                }
            }
        }
        else {
            io.sockets.to(socket.id).emit('error', "Missing room code or name");
        }
    })
    socket.on('disconnect', () => {
        if (socketMap.has(socket.id)) {
            let temp = roomMap.get(socketMap.get(socket.id).room).filter(id => id !== socket.id);
            if (temp.length == 0) {
                roomMap.delete(socketMap.get(socket.id).room);
            }
            else {
                roomMap.set(socketMap.get(socket.id).room, temp);
                roomMap.get(socketMap.get(socket.id).room).forEach(id => {
                    io.sockets.to(id).emit('leave', `${socketMap.get(socket.id).name}`);
                });
            }
            socketMap.delete(socket.id);
        }
    });
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});