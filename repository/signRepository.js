const database = require('../database/database');
const Sign = require('../model/UnknownSign');

async function addSign(sign) {
    const data = await database.db.one('INSERT INTO signs (lat, lon, name, user_id, photo, address, direction) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [sign.lat, sign.lon, sign.name, sign.user_id, sign.photo, sign.address, sign.direction]);
    return data.id;
}

async function addSignToQueue(signId) {
    await database.db.none('INSERT INTO processing_queue (sign_id) VALUES ($1)', [signId]);
}

async function getSigFromQueue() {
    const data = await database.db.oneOrNone('SELECT * FROM processing_queue INNER JOIN signs ON ' +
        '(processing_queue.sign_id = signs.id) order by id asc limit 1');
    return data;
}

module.exports = {
    addSign,
    addSignToQueue,
    getSigFromQueue
};
