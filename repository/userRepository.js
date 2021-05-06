const database = require('../database/database');
var User = require('../model/User');

async function register(name, login, role) {
    const data = await database.db.one('INSERT INTO users (name, phone_number, role) ' +
        'VALUES ($1, $2, $3) RETURNING id',
        [name, login, "user"]);
    return data.id;
}

async function getUserByLogin(login) {
    const user = await database.db.oneOrNone('SELECT * FROM users WHERE phone_number = $1', [login]);
    if (user != null) {
        let userModel = new User(user.id, user.name, user.phone_number, user.role);
        return userModel;
    }
    return null;
}

async function getUserById(id) {
    const user = await database.db.one('SELECT * FROM users WHERE id = $1', [id]);
    if (user != null) {
        let userModel = new User(user.id, user.name, user.phone_number, user.role);
        return userModel;
    }
    return null;
}

async function updateUserName(id, name) {
    await database.db.none('UPDATE users SET name = $1 WHERE id = $2', [name, id]);
}

async function saveSmsCode(code, login) {
    await database.db.none('INSERT INTO sms_auth_data (phone_number, sms_code, sms_expired_time) VALUES ($1, $2, (NOW() + interval \'3 minutes\')::TIMESTAMP) ' +
        'ON CONFLICT (phone_number) DO UPDATE SET sms_code = $2, sms_expired_time = (NOW() + interval \'3 minutes\')::TIMESTAMP',
        [login, code]);
}

async function smsCodeVerify(code, login) {
    const validity = await database.db.oneOrNone('SELECT * FROM sms_auth_data WHERE sms_code = $1 AND phone_number = $2 AND (sms_expired_time > NOW()::TIMESTAMP)',
        [code, login]);
    return !!validity;
}

module.exports = {
    register,
    getUserByLogin,
    getUserById,
    updateUserName,
    saveSmsCode,
    smsCodeVerify
}