const userRepository = require('../repository/userRepository');
const logger = require('../service/logService');
const authenticator = require('./security/authenticator');

async function changeName(req, res) {
    let user = await userRepository.getUserByLogin(req.body.login);
    try {
        await userRepository.updateUserName(user.id, req.body.name);
    } catch (err) {
        logger.log(err.message);
        res.status(500);
        res.json({message: "can't change user's name"})
        return;
    }
    res.json({message: "success"});
}

module.exports = function (app) {
    app.use('/user', authenticator.apiAuthenticateJWT);
    app.post('/user/changeName', changeName);
}