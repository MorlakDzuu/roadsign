const userRepository = require('../../repository/userRepository');
const smsService = require('../../service/smsService');
const validService = require('../../service/validService');
const logger = require('../../service/logService');

const jwt = require('jsonwebtoken');
const config = require('../../config');

const roles = {
    USER: 'user',
    ADMIN: 'admin'
}

async function register(req, res) {
    if (!validService.isValidPhoneNumber(req.body.login)) {
        res.status(406);
        res.json({error: 'phone number incorrect'});
        return;
    }
    let user = await userRepository.getUserByLogin(req.body.login);
    if (user != null) {
        res.status(406);
        res.json({error: 'this phone number exists'})
        return;
    }
    if (await userRepository.smsCodeVerify(req.body.smsCode, req.body.login)) {
        let id = 0;
        try {
            id = await userRepository.register(req.body.name, req.body.login, roles.USER);
        } catch (err) {
            logger.log(err);
            console.log(err);
        }
        if (id > 0) {
            const token = jwt.sign({id: id, role: roles.USER}, config.jwtApiAccessToken);
            res.json({token: token});
            return;
        } else {
            res.status(500);
            res.json({error: 'register failed'});
            return;
        }
    }
    res.status(500);
    res.json({error: 'sms code expired or incorrect'});
}

async function login(req, res) {
    if (!validService.isValidPhoneNumber(req.body.login)) {
        res.status(406);
        res.json({error: 'phone number incorrect'});
        return;
    }
    if (await userRepository.smsCodeVerify(req.body.smsCode, req.body.login)) {
        let id = 0;
        let user;
        try {
            user = await userRepository.getUserByLogin(req.body.login);
            id = user.id;
        } catch (err) {
            logger.log(err);
            console.log(err);
        }
        if (id > 0) {
            const token = jwt.sign({id: id, role: user.role}, config.jwtApiAccessToken);
            res.json({token: token});
            return;
        } else {
            res.status(500);
            res.json({error: 'auth failed'});
            return;
        }
    }
    res.status(500);
    res.json({error: 'sms code expired or incorrect'});
}

async function smsSend(req, res) {
    const code = generateCode();
    try {
        await userRepository.saveSmsCode(code, req.body.login);
        await smsService.sendSms(req.body.login, code);
        let user = await userRepository.getUserByLogin(req.body.login);
        if (user == null) {
            res.json({message: "not registered"});
        } else {
            res.json({message: 'registered'});
        }
    } catch (e) {
        console.log(e);
        logger.log(e);
        res.status(500);
        res.json({message: 'error'});
    }
}

function generateCode() {
    const low = 0;
    const high = 9;
    let code = "";
    for (let i = 0; i < 6; i++) {
        code = code + Math.round(Math.random() * (high - low) + low);
    }
    return code;
}

async function deleteUser(req, res) {
    try {
        await userRepository.deleteUser(req.body.login);
    } catch (err) {
        res.status(500);
        res.json({message: "can't delete this user"});
        return;
    }
    res.json({message: "success"});
}

module.exports = function (app) {
    app.post('/deleteUser', deleteUser);
    app.post('/register', register);
    app.post('/login', login);
    app.post('/smsSend', smsSend);
};