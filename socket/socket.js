const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../service/logService');
const signService = require('../service/signService');
const confirmedSignRepository = require('../repository/confirmedSignRepository');
const fs = require('fs');
const UnknownSign = require("../model/UnknownSign");

function verify(socket, next) {
    console.log(socket.handshake);
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
        let lat = data.lat;
        let lon = data.lon;
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
        let unknownSign = new UnknownSign(lat, lon, userId, name, "", direction);
        await signService.addSign(unknownSign);
    });

    socket.on('getSigns', async function(data) {
        try {
            await signService.getSignsCluster(data.leftDown, data.leftUp, data.rightDown, data.rightUp,
                data.lat, data.lon, data.filter, data.needConfirmed, data.needUnconfirmed).then(signs => {
                sendNotificationData(signs[0], userId, 'cluster1');
                sendNotificationData(signs[1], userId, 'cluster2');
                sendNotificationData(signs[2], userId, 'cluster3');
                sendNotificationData(signs[3], userId, 'cluster4');
            });
        } catch (err) {
            console.log(err);
            logger.log(err.message);
        }
    });
}

function init() {
    io.use(verify)
        .on('connection', connection);
}

module.exports = {
    init
};
