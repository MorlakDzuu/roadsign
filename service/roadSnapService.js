const request = require('request');

const GOOGLE_API_KEY = "AIzaSyCSrHgdEfp36cET6bxG_yw2EMUCGyl76a8";

async function makeGoogleApiRequest(lat, lon) {
    try {
        let url = 'https://roads.googleapis.com/v1/snapToRoads?path=' + lat + ',' + lon + '&interpolate=true&key=' +
            + GOOGLE_API_KEY;
        request.post({url: url}, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.log('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    makeGoogleApiRequest
}