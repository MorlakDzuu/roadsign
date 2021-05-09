const Sign =  require("./model/Sign");

const bodyParser = require('body-parser');
import randomFloat from 'random-float';
const signRepository = require('./repository/signRepository');
const confirmedSignRepository = require('./repository/confirmedSignRepository');

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
require('./controller/signController')(app);

server.listen(port, function() {
    console.log('Skill change started on port ' + port);
});

require('./socket/socket').init();

for (let i = 0; i < 10000; i++) {
    let lat = randomFloat(55.566060, 55.913405);
    let lon = randomFloat(37.354691, 37.859707);
    let type = Math.floor(Math.random() * 10);
    let sign = new Sign(0, lat, lon, type, 12, 'test', 'test');
    let id = await signRepository.addSign(sign);
    await confirmedSignRepository.confirmSignById(id);
}