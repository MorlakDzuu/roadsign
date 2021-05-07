const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../service/logService');
const signService = require('../service/signService');
const confirmedSignRepository = require('../service/confirmedSignRepository');
const fs = require('fs');
const UnknownSign = require("../model/UnknownSign");

function verify(socket, next) {
    let token = socket.handshake.query.token;
    jwt.verify(token, config.jwtApiAccessToken, (error, user) => {
        if (error) {
            logger.log(error);
            return next(new Error('Authentication error'));
        }
        next();
    });
}

function sendNotificationData(data, userId, key) {
    let socketId;
    global.connections.forEach(socket => {
        if (socket.username == userId) {
            socketId = socket.id;
        }
    });
    if (socketId) {
        io.to(socketId).emit(key, data);
    }
}

function connection(socket) {
    let token = socket.handshake.query.token;
    let userId = jwt.decode(token).id;
    socket.username = userId;
    global.connections.push(socket);

    socket.on('disconnect', function(data) {
        global.connections.splice(connections.indexOf(socket), 1);
        console.log('Socket disconnected: ' + socket);
    });

    socket.on('sendFile', async function(data) {
        let name = uuidv4() + ".jpeg";
        let buffer = data.buffer;
        let coordinates = data.coordinates;
        let direction = data.direction;

        let path = __dirname.replace('/socket', '') + '/uploads/' + name;

        fs.open(path, 'a', 0o755, function(err, fd) {
            if (err) throw err;

            fs.write(fd, buffer, null, 'Binary', function(err, written, buff) {
                fs.close(fd, function() {
                    console.log('File saved successful!');
                });
            })
        });
        let unknownSign = new UnknownSign(coordinates, userId, name, "", direction);
        await signService.addSign(unknownSign);
    });

    socket.on('getSigns', async function(data) {
        let signs = await confirmedSignRepository.getSigns(data.radius, data.coordinate, data.filter);
        let jsonSigns = {
            signs: signs
        };
        sendNotificationData(jsonSigns, userId, 'signs');
    });
}

function init() {
    io.use(verify)
        .on('connection', connection);
}

module.exports = {
    init
};
