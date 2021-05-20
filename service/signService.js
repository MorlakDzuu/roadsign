const signRepository = require('../repository/signRepository');
const confirmedSignRepository = require('../repository/confirmedSignRepository');
const UnknownSign = require('../model/UnknownSign');
const Sign = require('../model/Sign');

const MAX_SIGNS_COUNT = 100;

async function addSign(unknownSign) {
    let sign = Sign.initWithUnknownSign(unknownSign, 0, '');
    sign.id = await signRepository.addSign(sign);
    await signRepository.addSignToQueue(sign.id);
    return sign;
}

function getSignModel(sign, confirmed) {
    return {
        uuid: sign.photo,
        lat: sign.lat,
        lon: sign.lon,
        type: sign.name,
        address: sign.lat + " ," + sign.lon,
        correct: confirmed
    };
}

async function getSignsCluster(leftDown, leftUp, rightDown, rightUp, lat, lon, filter, needConfirmed, needUnconfirmed) {
    let signsUnconfirmed = [];
    let signsConfirmed = [];
    if (needUnconfirmed) {
        signsUnconfirmed = await signRepository.getSigns(leftDown, leftUp, rightDown, rightUp, lat, lon, filter);
    }
    if (needConfirmed) {
        signsConfirmed = await confirmedSignRepository.getSigns(leftDown, leftUp, rightDown, rightUp, lat, lon, filter);
    }
    let cluster1 = [];
    let cluster2 = [];
    let cluster3 = [];
    let cluster4 = [];
    signsConfirmed.forEach(sign => {
        if (sign.lat >= lat) {
            if (sign.lon >= lon) {
                cluster2.push(getSignModel(sign, true));
            } else {
                cluster1.push(getSignModel(sign, true));
            }
        } else {
            if (sign.lon >= lon) {
                cluster4.push(getSignModel(sign, true));
            } else {
                cluster3.push(getSignModel(sign, true));
            }
        }
    });
    signsUnconfirmed.forEach(sign => {
        if (sign.lat >= lat) {
            if (sign.lon >= lon) {
                cluster2.push(getSignModel(sign, false));
            } else {
                cluster1.push(getSignModel(sign, false));
            }
        } else {
            if (sign.lon >= lon) {
                cluster4.push(getSignModel(sign, false));
            } else {
                cluster3.push(getSignModel(sign, false));
            }
        }
    });
    let cluster1Size = cluster1.length;
    if (cluster1Size > MAX_SIGNS_COUNT) {
        cluster1 = null;
    }
    let cluster2Size = cluster2.length;
    if (cluster2Size > MAX_SIGNS_COUNT) {
        cluster2 = null;
    }
    let cluster3Size = cluster3.length;
    if (cluster3Size > MAX_SIGNS_COUNT) {
        cluster3 = null;
    }
    let cluster4Size = cluster4.length;
    if (cluster4Size > MAX_SIGNS_COUNT) {
        cluster4 = null;
    }
    let signsArray = [];
    signsArray.push({
        size: cluster1Size,
        signs: cluster1
    });
    signsArray.push({
        size: cluster2Size,
        signs: cluster2
    });
    signsArray.push({
        size: cluster3Size,
        signs: cluster3
    });
    signsArray.push({
        size: cluster4Size,
        signs: cluster4
    });
    console.log(signsArray);
    return signsArray;
}

module.exports = {
    addSign,
    getSignsCluster
}