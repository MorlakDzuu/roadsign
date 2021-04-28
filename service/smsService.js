const axios = require('axios');

const config = require('../config');

const bodyMsg = "Код авторизации: ";


async function sendSms(phone, code) {
    const params = {
        api_id: config.smsApiKey,
        to: phone,
        msg: bodyMsg + code,
        json: 1
    };
    const body = {
        params: params
    };
    await axios.get('https://sms.ru/sms/send', body);
}


module.exports = {
    sendSms
};