const signRepository = require('../repository/signRepository');
const confirmedSignRepository = require('../repository/confirmedSignRepository');
const logger = require('../service/logService');
const authenticator = require('./security/authenticator');
const signService = require('../service/signService');
const socket = require('../socket/socket');
const userRepository = require('../repository/userRepository');

const jwt = require('jsonwebtoken');
const Sign = require("../model/Sign");
const multer = require("multer");
const UnknownSign = require("../model/UnknownSign");

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storageConfig});

async function addSign(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    let lat = req.body.lat;
    let lon = req.body.lon;
    let name = req.body.name;
    let address = req.body.address;
    let uuid = req.body.uuid;
    try {
        let sign = new Sign(0, lat, lon, name, userId, uuid, address, 1);
        let signId = await signRepository.addSign(sign);
        let confirmed = false;
        let user = await userRepository.getUserById(userId);
        if (user.role == 'admin') {
            await confirmedSignRepository.confirmSignById(signId);
            confirmed = true;
        }
        socket.sendNotificationDataToAll(signService.getSignModel(sign, confirmed), "newSign");

        let signsNumber = await signRepository.getNumberOfSignsByUserId(userId);
        socket.sendNotificationData({message: signsNumber}, userId, "signsNumber");
        sign.signId = signId;
        res.json({message: sign});
    } catch (err) {
        logger.log(err.message);
        res.status(500);
        res.json({message: 'error'});
    }
}

async function confirmSign(req, res) {
    let signId = req.body.signId;
    try {
        await confirmedSignRepository.confirmSignById(signId);
    } catch (err) {
        res.json({message: err.message});
        return;
    }
    res.json({message: 'success'});
}

async function getSigns(req, res) {
    try {
        let signs = await signService.getSignsCluster(req.body.leftDown, req.body.leftUp, req.body.rightDown,
            req.body.rightUp, req.body.lat, req.body.lon, null, req.body.needConfirmed, req.body.needUnconfirmed);
        res.json(signs);
    } catch (err) {
        res.status(500);
        return;
    }
}

async function additionalSignShipment(req, res) {
    let photoId = req.body.id;
    let lat = req.body.lat;
    let lon = req.body.lon;
    let direction = req.body.direction;
    let userId = jwt.decode(req.headers.authorization).id;
    let unknownSign = new UnknownSign(lat, lon, userId, photoId, "", direction);
    try {
        await signService.addSign(unknownSign);
    } catch (err) {
        logger.log(err.message);
        res.status(500);
        res.json({message: "error"});
    }
    res.json({message: "success"});
}

async function editSign(req, res) {
    let uuid = req.body.uuid;
    let oldName = req.body.oldName;
    let name = req.body.name;
    let address = req.body.address;
    let confirmed = req.body.confirmed;
    let lat = req.body.lat;
    let lon = req.body.lon;

    try {
        let sign = await signRepository.getSignByUuidAndName(uuid, oldName);
        sign.name = name;
        sign.address = address;
        sign.lat = lat;
        sign.lon = lon;
        let confirmedOld = await confirmedSignRepository.isSignConfirmed(sign.id);
        if (!confirmedOld && confirmed) {
            await confirmedSignRepository.confirmSignById(sign.id);
        } else if (!confirmed && confirmedOld) {
            await confirmedSignRepository.deleteSign(sign.id);
        }
        await signRepository.editSign(sign);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function getSignsNumber(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let number = await signRepository.getNumberOfSignsByUserId(userId);
        res.json({message: number});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

module.exports = function (app) {
    app.get('/getSigns', getSigns);

    app.use('/sign', authenticator.apiAuthenticateJWT);
    app.post('/sign/addSign', addSign);
    app.post('/sign/addInfo', additionalSignShipment);
    app.get('/sign/getSignsNumber', getSignsNumber);

    app.use('/sign', authenticator.apiAuthenticateAdminJWT);
    app.post('/sign/confirmSign', confirmSign);
    app.post('/sign/editSign', editSign);
}

