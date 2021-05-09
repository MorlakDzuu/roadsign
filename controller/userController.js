const signRepository = require('../repository/signRepository');
const Sign =  require("../model/Sign");

const userRepository = require('../repository/userRepository');
const logger = require('../service/logService');
const authenticator = require('./security/authenticator');
const confirmedSignRepository = require('../repository/confirmedSignRepository');

const jwt = require('jsonwebtoken');

async function changeName(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    let user = await userRepository.getUserById(userId);
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

async function initDB() {
    for (let i = 0; i < 10000; i++) {
        let lat = Math.random()*(55.913405 - 55.566060) + 55.566060;
        let lon = Math.random()*(37.859707 - 37.354691) + 37.354691;
        let type = Math.floor(Math.random() * 10);
        let sign = new Sign(0, lat, lon, type, 12, 'test', 'test');
        let id = await signRepository.addSign(sign);
        await confirmedSignRepository.confirmSignById(id);
    }
}

async function getProfile(req, res) {
    initDB().then();
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let user = await userRepository.getUserById(userId);
        let signsCount = await confirmedSignRepository.getSignsCountByUserId(userId);
        res.json({
            id: user.id,
            phone: user.phone_number,
            name: user.name,
            role: user.role,
            signsCount: signsCount
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