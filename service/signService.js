const signRepository = require('../repository/signRepository');
const UnknownSign = require('../model/UnknownSign');
const Sign = require('../model/Sign');

async function addSign(unknownSign) {
    let sign = Sign.initWithUnknownSign(unknownSign, 0, 'name');
    sign.id = await signRepository.addSign(sign);
    return sign;
}

module.exports = {
    addSign
}