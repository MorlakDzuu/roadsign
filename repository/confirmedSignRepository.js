const database = require('../database/database');

async function confirmSignById(signId) {
    await database.db.none('INSERT INTO confirmed_signs (sign_id) VALUES ($1)', [signId]);
}

async function deleteSign(signId) {
    await database.db.none('DELETE * FROM confirmed_signs WHERE sign_id = $1', [signId]);
}

async function getSigns(leftDown, leftUp, rightDown, rightUp, lat, lon, filter) {
    /* //let data = await database.db.manyOrNone('SELECT * FROM signs WHERE ((lat - $1)^2 + (lon - $2)^2 <= $3^2)', [lat, lon, radius]);
    //let data = await database.db.manyOrNone('SELECT * FROM signs WHERE ' +
    //    '111.111 *\n' +
    //    '    DEGREES(ACOS(COS(RADIANS(lat))\n' +
    //    '         * COS(RADIANS($1))\n' +
    //    '         * COS(RADIANS(lon - $2))\n' +
    //    '         + SIN(RADIANS(lat))\n' +
    //    '         * SIN(RADIANS($3)))) <= $4', [lat, lon, lat, radius]);
     */
    let data = await database.db.manyOrNone('SELECT * FROM confirmed_signs INNER JOIN signs ON ' +
        '(confirmed_signs.sign_id = signs.id) WHERE (signs.lat > $1) AND (signs.lat < $2) AND (signs.lon > $3) AND (signs.lon < $4)',
        [leftDown.lat, rightUp.lat, leftDown.lon, rightUp.lon]);
    return data;
}

async function getSignsCountByUserId(userId) {
    let data = await database.db.one('SELECT COUNT(*) FROM confirmed_signs INNER JOIN signs ON ' +
        '(confirmed_signs.sign_id = signs.id) WHERE signs.user_id = $1', [userId]);
    return data.count;
}

async function isSignConfirmed(signId) {
    let data = await database.db.manyOrNone('SELECT * FROM confirmed_signs WHERE sign_id = $1', [signId]);
    if (data == null) {
        return false;
    }
    return true;
}

module.exports = {
    confirmSignById,
    deleteSign,
    getSignsCountByUserId,
    getSigns,
    isSignConfirmed
}