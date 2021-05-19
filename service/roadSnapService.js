const request = require('request');

const GOOGLE_API_KEY = "AIzaSyDN7fDyGLsp9XwsZWId2Y7EOHF_G5GGM2c";

async function makeGoogleApiRequest(lat, lon) {
    try {
        request.get({url:'https://roads.googleapis.com/v1/snapToRoads?path'
                + lat + ',' + lon + '&key=' + GOOGLE_API_KEY}, function optionalCallback(err, httpResponse, body) {
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