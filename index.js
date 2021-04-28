const bodyParser = require('body-parser');

let app = require('express')();

const port = 3000;

app.use(bodyParser.json());

require('./controller/security/authController')(app);
require('./controller/userController')(app);

app.listen(port, function() {
    console.log('Skill change started on port ' + port);
});