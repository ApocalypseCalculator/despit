'use strict';

const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ strict: true }));
app.enable('trust proxy');

const server = require('http').createServer(app);
const socketio = require('socket.io')(server);

app.use('/cdn', (req, res) => {
    if (fs.existsSync(`./cdn${req.url}`)) {
        res.sendFile(path.join(__dirname + `/cdn${req.url}`));
    }
    else {
        res.status(404).send('Oops! I cannot find the file you specified!');
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});