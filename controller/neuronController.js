const logger = require('../service/logService');
const signRepository = require('../repository/signRepository');

async function authenticator (req, res, next) {
    const token = req.headers.token;
    if (token != '123') {
        res.status(500);
        res.json({message: "auth error"});
        return;
    }
    next();
}

async function getPhoto(req, res) {
    try {
        let sign = await signRepository.getSigFromQueue();
        if (sign == null) {
            res.json({message: 'no photo to process'});
            return;
        }
        let fileName = sign.photo;
        let path = __dirname.replace("controller", "uploads/") + fileName;
        res.setHeader('id', fileName);
        res.download(path, fileName);
    } catch (err) {
        logger.log(err.message);
        res.json({message: err.message});
    }
}

async function sendPhotoInfo(req, res) {
    console.log(req.headers.id);
    req.on('files', function (files) {
        console.log(files);
    });
    res.json({message: "okey"});
}

module.exports = function (app) {
    app.use('/neuron', authenticator);
    app.get('/neuron/getPhoto', getPhoto);
    app.post('/neuron/sendPhotoInfo', sendPhotoInfo);
}