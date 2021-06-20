'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
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
    /*socket.on('message', (msg) => {
        io.emit('message', msg);
    });*/
    socket.on('setname', (obj) => {
        if (obj.room && obj.name) {
            let token = jwt.sign({ name: obj.name, socket: socket.id }, config.TOKEN_SECRET);
            socket.broadcast.to(socket.id).emit('jwt', { token: token });
            if (roomMap.has(obj.room)) {
                roomMap.set(obj.room, roomMap.get(obj.room).push(socket.id));
                socketMap.set(socket.id, obj.room);
            }
            else {
                //create new room here
            }
        }
    })
    socket.on('disconnect', () => {
        if (socketMap.has(socket.id)) {
            let temp = roomMap.get(socketMap.get(socket.id)).filter(id => id !== socket.id);
            if (temp.length == 0) {
                roomMap.delete(socketMap.get(socket.id));
            }
            else {
                roomMap.set(socketMap.get(socket.id), temp);
            }
            socketMap.delete(socket.id);
        }
    });
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});