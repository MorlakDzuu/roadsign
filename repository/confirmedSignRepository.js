const database = require('../database/database');

async function confirmSignById(signId) {
    await database.db.none('INSERT INTO confirmed_signs (sign_id) VALUES ($1)', [signId]);
}

async function deleteSign(signId) {
    await database.db.none('DELETE FROM confirmed_signs WHERE sign_id = $1', [signId]);
}

async function getSigns(leftDown, leftUp, rightDown, rightUp, lat, lon, filter) {
    let queryArray = [leftDown.lat, rightUp.lat, leftDown.lon, rightUp.lon];
    let query = 'SELECT * FROM confirmed_signs INNER JOIN signs ON ' +
        '(confirmed_signs.sign_id = signs.id) WHERE (signs.lat > $1) AND (signs.lat < $2) AND (signs.lon > $3) AND (signs.lon < $4)';
    if (filter.length > 0) {
        query += ' AND (';
        for(let i = 0; i < filter.length; i++) {
            query += '(signs.name = $' + (i+5) + ')';
            if ((i + 1) != filter.length) {
                query += ' OR ';
            }
            queryArray.push(filter[i]);
        }
        query += ')';
        let data = await database.db.manyOrNone(query, queryArray);
        return data;
    }
    return [];
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