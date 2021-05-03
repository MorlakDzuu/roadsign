const bodyParser = require('body-parser');

let app = require('express')();

const port = 8080;

app.use(bodyParser.json());

require('./controller/security/authController')(app);
require('./controller/userController')(app);
require('./controller/fileController')(app);

app.listen(port, function() {
    console.log('Skill change started on port ' + port);
});