const database = require('../database/database');
const Sign = require('../model/UnknownSign');

async function addSign(sign) {
    const data = await database.db.one('INSERT INTO signs (coordinates, user_id, photo, address, direction) ' +
        'VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [sign.coordinates, sign.user_id, sign.photo, sign.address, sign.direction]);
    return data.id;
}

module.exports = {
    addSign
};
