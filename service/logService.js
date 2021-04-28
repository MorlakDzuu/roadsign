const fs = require("fs");

function log(info) {
    try {
        let now = new Date();
        let resString = '[date: ' + now.toDateString() + ', hours: ' + now.getHours() + ', minutes: ' + now.getMinutes() + ', seconds: ' + now.getSeconds() + '] ';
        resString += info.toString() + '\n';
        fs.appendFileSync("log.txt", resString);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    log
};