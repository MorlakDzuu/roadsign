const signRepository = require('../repository/signRepository');
const confirmedSignRepository = require('../repository/confirmedSignRepository');
const logger = require('../service/logService');
const authenticator = require('./security/authenticator');
const signService = require('../service/signService');

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
        await confirmedSignRepository.confirmSignById(signId);
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

module.exports = function (app) {
    app.get('/getSigns', getSigns);

    app.use('/sign', authenticator.apiAuthenticateJWT);
    app.post('/sign/addSign', addSign);
    app.post('/sign/addInfo', additionalSignShipment);

    app.use('/sign', authenticator.apiAuthenticateAdminJWT);
    app.post('/sign/confirmSign', confirmSign);
    app.post('/sign/editSign', editSign);
}

