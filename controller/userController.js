const userRepository = require('../repository/userRepository');
const logger = require('../service/logService');
const authenticator = require('./security/authenticator');

const jwt = require('jsonwebtoken');

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

async function getProfile(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let user = await userRepository.getUserById(userId);
        res.json({
            phone: user.phone_number,
            name: user.name,
            role: user.role
        });
        return
    } catch (err) {
        logger.log(err.message);
        res.status(500);
        res.json({message: "can't find user"});
    }
}

module.exports = function (app) {
    app.use('/user', authenticator.apiAuthenticateJWT);
    app.post('/user/changeName', changeName);
    app.get('/user/getProfile', getProfile);
}