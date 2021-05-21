const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../../service/logService');
const userRepository = require('../../repository/userRepository');

function apiAuthenticateJWT(req, res, next) {
    const token = req.headers.authorization;
    jwt.verify(token, config.jwtApiAccessToken, (error, user) => {
        if (error) {
            logger.log(error);
            res.status(401);
            res.json({message: "auth error"});
            return;
        }
        req.user = user;
        next();
    });
}

async function apiAuthenticateAdminJWT(req, res, next) {
    const token = req.headers.authorization;
    try {
        let userInfo = await userRepository.getUserById(jwt.decode(token).id);
        jwt.verify(token, config.jwtApiAccessToken, (error, user) => {
            if (error || userInfo.role == 'user') {
                logger.log(error);
                res.status(401);
                res.json({message: "auth error"});
                return;
            }
            req.user = user;
            next();
        });
    } catch (err) {
        logger.log(err);
        res.status(401);
        res.json({message: "auth error"});
    }
}

module.exports = {
    apiAuthenticateJWT,
    apiAuthenticateAdminJWT
};