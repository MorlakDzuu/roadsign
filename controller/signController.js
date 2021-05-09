const signRepository = require('../repository/signRepository');
const confirmedSignRepository = require('../repository/confirmedSignRepository');
const logger = require('../service/logService');
const authenticator = require('./security/authenticator');
const signService = require('../service/signService');

const jwt = require('jsonwebtoken');
const Sign = require("../model/Sign");
const multer = require("multer");

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
    let address = req.body.address;
    let name = req.body.name;
    let filedata = req.file;
    if(!filedata) {
        res.status(500);
        res.json({error: "Exception while working with file"});
    }
    let photo = __dirname.replace("controller", "uploads/") + filedata.filename;
    let sign = new Sign(0, lat, lon, name, userId, photo, address);
    try {
        let signId = await signRepository.addSign(sign);
        await confirmedSignRepository.confirmSignById(signId);
    } catch (err) {
        logger.log(err.message);
        res.json({message: err.message});
        return;
    }

    res.json({message: 'success'});
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
        let signs = await signService.getSignsCluster(1000, 55.759003, 37.622381, null);
        res.json({message: signs});
    } catch (err) {
        res.status(500);
        return;
    }
}

module.exports = function (app) {
    app.get('/getSigns', getSigns);
    app.use('/sign', authenticator.apiAuthenticateAdminJWT);
    app.post('/sign/addSign', upload.single("filedata"), addSign);
    app.post('/sign/confirmSign', confirmSign);
}

