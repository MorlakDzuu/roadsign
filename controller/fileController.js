const logger = require('../service/logService');
const authenticator = require('./security/authenticator');
const UnknownSign = require('../model/UnknownSign');
const signService = require('../service/signService');

const jwt = require('jsonwebtoken');
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

async function saveImageInfo(req, res) {
    let coordinates = req.body.coordinates;
    let address = req.body.address;
    let userId = jwt.decode(req.headers.authorization).id;
    let filedata = req.file;
    if(!filedata) {
        res.status(500);
        res.json({error: "Exception while working with file"});
    }
    let download_path = __dirname.replace("controller", "uploads/") + filedata.filename;

    let unknownSign = new UnknownSign(coordinates, userId, download_path, address);
    let sign = await signService.addSign(unknownSign);
    res.json({sign: sign});
}

async function getFile(req, res) {
    let fileName = req.params.uuid + '.jpeg';
    let path = __dirname.replace("controller", "uploads/") + fileName;
    res.download(path, fileName);
}

module.exports = function (app) {
    app.use('/file', authenticator.apiAuthenticateJWT);
    app.post('/file/upload', upload.single("filedata"), saveImageInfo);
    app.get('/file/getFile/:uuid', getFile);
}