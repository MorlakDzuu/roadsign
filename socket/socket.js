const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../service/logService');
const fs = require('fs');


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

function connection(socket) {
    //let token = socket.handshake.query.token;
    //let userId = jwt.decode(token).id;
    //socket.username = userId;
    global.connections.push(socket);
    socket.on('NodeJS Server Port', function(data) {
        console.log('recieved data: ' + data);
        io.sockets.emit('IOS Client Port', {msg: 'Hi iOS Client!'});
    });
    socket.on('disconnect', function(data) {
        global.connections.splice(connections.indexOf(socket), 1);
        console.log('Socket disconnected: ' + socket);
    });
    socket.on('test', async function(data) {
        console.log(data);
    });
    socket.on('send-file', function(name, buffer) {

        //path to store uploaded files (NOTE: presumed you have created the folders)
        let fileName = __dirname.replace('/socket', '') + '/uploads/' + name;

        fs.open(fileName, 'a', 0o755, function(err, fd) {
            if (err) throw err;

            fs.write(fd, buffer, null, 'Binary', function(err, written, buff) {
                fs.close(fd, function() {
                    console.log('File saved successful!');
                });
            })
        });
    });
}

function init() {
    io.on('connection', connection);
}

module.exports = {
    init
};
