const logger = require('../service/logService');
const authenticator = require('./security/authenticator');
const UnknownSign = require('../model/UnknownSign');
const signService = require('../service/signService');

const jwt = require('jsonwebtoken');
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, uuidv4() + ".jpeg");
    }
});
const upload = multer({storage: storageConfig});

async function addPhoto(req, res) {
    let fileData = req.file;
    if(fileData == null) {
        res.status(500);
        res.json({message: "Exception while working with file"});
        return;
    }
    res.json({id: fileData.filename});
}

async function getFile(req, res) {
    let fileName = req.params.uuid + '.jpeg';
    let path = __dirname.replace("controller", "uploads/") + fileName;
    res.download(path, fileName);
}

module.exports = function (app) {
    app.use('/file', authenticator.apiAuthenticateJWT);
    app.post('/file/upload', upload.single("filedata"), addPhoto);
    app.get('/file/getFile/:uuid', getFile);
}