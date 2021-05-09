const initOptions = require('./database.properties');

var pgp = require("pg-promise")();

const db = pgp(initOptions);

module.exports = {
    db, pgp
};