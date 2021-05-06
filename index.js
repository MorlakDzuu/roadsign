const bodyParser = require('body-parser');

let app = require('express')();
let http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
global.io = new Server(server);


global.connections = [];

const port = 8080;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    console.log(__dirname + '/index.html');
    res.sendFile(__dirname + '/index.html');
});

require('./controller/security/authController')(app);
require('./controller/userController')(app);
require('./controller/fileController')(app);

server.listen(port, function() {
    console.log('Skill change started on port ' + port);
});

require('./socket/socket').init();