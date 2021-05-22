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
        " AND (name != '') AND ((SELECT COUNT(*) FROM confirmed_signs WHERE confirmed_signs.sign_id = signs.id) = 0)",
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

async function editSign(sign) {
    await database.db.none('UPDATE signs SET lat = $1, lon = $2, name = $3, user_id = $4, photo = $5, address = $6 ' +
        'WHERE id = $7', [sign.lat, sign.lon, sign.name, sign.user_id, sign.photo, sign.address, sign.id]);
}

async function getSignByUuid(uuid) {
    const data = await database.db.one('SELECT * FROM signs WHERE photo = $1', [uuid]);
    return data;
}

async function getSignByUuidAndName(uuid, name) {
    const data = await database.db.one('SELECT * FROM signs WHERE (photo = $1) AND (name = $2)', [uuid, name]);
    return data;
}

async function getNumberOfSignsByUserId(userId) {
    const data = await database.db.one('SELECT COUNT(*) FROM signs WHERE user_id = $1', [userId]);
    return data.count;
}

async function isSignAlreadyDetected(lat, lon, uuid, type) {
    let radius = 0.010;
    let data = await database.db.manyOrNone('SELECT * FROM signs WHERE ' +
        '(111.111 *\n' +
        '    DEGREES(ACOS(COS(RADIANS(lat))\n' +
        '         * COS(RADIANS($1))\n' +
        '         * COS(RADIANS(lon - $2))\n' +
        '         + SIN(RADIANS(lat))\n' +
        '         * SIN(RADIANS($3)))) <= $4) AND (name = $5)', [lat, lon, lat, radius, type]);
    console.log(data);
    if (data.length == 0) {
        return false;
    }
    return true;
}

module.exports = {
    addSign,
    addSignToQueue,
    getSignFromQueue,
    getSignByUuid,
    deleteSignFromQueueBySignId,
    getSigns,
    deleteSignById,
    editSign,
    getSignByUuidAndName,
    isSignAlreadyDetected,
    getNumberOfSignsByUserId
};
