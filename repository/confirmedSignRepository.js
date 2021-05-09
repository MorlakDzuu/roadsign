const database = require('../database/database');

async function confirmSignById(signId) {
    await database.db.none('INSERT INTO confirmed_signs (sign_id) VALUES ($1)', [signId]);
}

async function editSign(sign) {
    await database.db.none('UPDATE signs SET lat = $1, lon = $2, name = $3, user_id = $4, photo = $5, address = $6 ' +
        'WHERE id = $7', [sign.lat, sign.lon, sign.name, sign.user_id, sign.photo, sign.address, sign.id]);
}

async function deleteSign(signId) {
    await database.db.none('DELETE * FROM confirmed_signs WHERE sign_id = $1', [signId]);
}

async function getSigns(radius, lat, lon, filter) {
    let data = await database.db.manyOrNone('SELECT * FROM signs WHERE (lat - $1)^2 + (lon - $2)^2 <= $3^2', [lat, lon, radius]);
    return data;
}

async function getSignsCountByUserId(userId) {
    let count = await database.db.one('SELECT COUNT(*) FROM confirmed_signs INNER JOIN signs ON ' +
        '(confirmed_signs.sign_id = signs.id) WHERE signs.user_id = $1', [userId]);
    return count;
}

module.exports = {
    confirmSignById,
    editSign,
    deleteSign,
    getSignsCountByUserId,
    getSigns
}