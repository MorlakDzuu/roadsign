const database = require('../database/database');
const Sign = require('../model/UnknownSign');

async function addSign(sign) {
    const data = await database.db.one('INSERT INTO signs (lat, lon, name, user_id, photo, address, direction) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [sign.lat, sign.lon, sign.name, sign.user_id, sign.photo, sign.address, sign.direction]);
    return data.id;
}

async function getSigns(leftDown, leftUp, rightDown, rightUp, lat, lon, filter) {
    let data = await database.db.manyOrNone("SELECT * FROM signs WHERE (lat > $1) AND (lat < $2) AND (lon > $3) AND (lon < $4)" +
        " AND (name != '')",
        [leftDown.lat, rightUp.lat, leftDown.lon, rightUp.lon]);
    return data;
}

async function addSignToQueue(signId) {
    await database.db.none('INSERT INTO processing_queue (sign_id) VALUES ($1)', [signId]);
}

async function getSignFromQueue() {
    const data = await database.db.oneOrNone('SELECT * FROM processing_queue INNER JOIN signs ON ' +
        '(processing_queue.sign_id = signs.id) order by processing_queue.id asc limit 1');
    return data;
}

async function deleteSignFromQueueBySignId(signId) {
    await database.db.none('DELETE FROM processing_queue WHERE sign_id = $1', [signId]);
}

async function deleteSignById(signId) {
    await database.db.none('DELETE FROM signs WHERE id = $1', [signId]);
}

async function getSignByUuid(uuid) {
    const data = await database.db.one('SELECT * FROM signs WHERE photo = $1', [uuid]);
    return data;
}

module.exports = {
    addSign,
    addSignToQueue,
    getSignFromQueue,
    getSignByUuid,
    deleteSignFromQueueBySignId,
    getSigns,
    deleteSignById
};
