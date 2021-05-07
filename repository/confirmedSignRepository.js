const database = require('../database/database');

async function confirmSignById(signId, name) {
    await database.db.none('INSERT INTO confirmed_signs (sign_id, name) ' +
        'VALUES ($1, $2)', [signId, name]);
}

async function editSign(sign) {
    await database.db.none('UPDATE signs SET coordinates = $1, name = $2, user_id = $3, photo = $4, address = $5 ' +
        'WHERE id = $6', [sign.coordinates, sign.name, sign.user_id, sign.photo, sign.address, sign.id]);
}

async function deleteSign(signId) {
    await database.db.none('DELETE * FROM confirmed_signs WHERE sign_id = $1', [signId]);
}

module.exports = {
    confirmSignById,
    editSign,
    deleteSign
}