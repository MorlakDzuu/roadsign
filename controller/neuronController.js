const logger = require('../service/logService');
const signRepository = require('../repository/signRepository');
const fs = require('fs');


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
    console.log(req.body);
    let labels = req.body.labels;
    let distances = req.body.distances;
    let uuid = req.headers.id.toString();
    uuid.replace('.jpeg', '_square.jpeg');
    console.log(uuid);
    let image = req.body.image;
    try {
        let buffer = Buffer.from(image);
        let path = __dirname.replace('/controller', '') + '/uploads/' +
            + uuid;
        fs.open(path, 'a', 0o755, function(err, fd) {
            if (err) throw err;

            fs.write(fd, buffer, null, 'Binary', function(err, written, buff) {
                fs.close(fd, function() {
                    console.log(path);
                    console.log('File saved successful!');
                });
            })
        });
    } catch (err) {
        logger.log(err.message);
        res.status(500);
        res.json({message: err.message});
        return;
    }
    res.json({message: "okey"});
}

module.exports = function (app) {
    app.use('/neuron', authenticator);
    app.get('/neuron/getPhoto', getPhoto);
    app.post('/neuron/sendPhotoInfo', sendPhotoInfo);
}