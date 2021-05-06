const database = require('../database/database');
const Sign = require('../model/UnknownSign');

async function addSign(sign) {
    const data = await database.db.one('INSERT INTO signs (coordinates, name, user_id, photo, address) ' +
        'VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [sign.coordinates, sign.name, sign.user_id, sign.photo, sign.address]);
    return data.id;
}

module.exports = {
    addSign
};
