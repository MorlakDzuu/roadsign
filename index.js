const bodyParser = require('body-parser');

let app = require('express')();
let http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
global.io = new Server(server);
const gen = require('./database/generate');


global.connections = []

const port = 3030;

app.get('/', (req, res) => {
    console.log(__dirname + '/index.html');
    res.sendFile(__dirname + '/index.html');
});

require('./controller/neuronController')(app);
app.use(bodyParser.json());
a
require('./controller/security/authController')(app);
require('./controller/userController')(app);
require('./controller/fileController')(app);
require('./controller/signController')(app);

server.listen(port, function() {
    console.log('Signs started on port ' + port);
});

require('./socket/socket').init();