const signRepository = require('../repository/signRepository');
const confirmedSignRepository = require('../repository/confirmedSignRepository');
const UnknownSign = require('../model/UnknownSign');
const Sign = require('../model/Sign');

const MAX_SIGNS_COUNT = 50;

async function addSign(unknownSign) {
    let sign = Sign.initWithUnknownSign(unknownSign, 0, 'name');
    sign.id = await signRepository.addSign(sign);
    return sign;
}

function getSignModel(sign) {
    return {
        uuid: sign.photo,
        lat: sign.lat,
        lon: sign.lon,
        type: sign.name,
        correct: true
    };
}

async function getSignsCluster(radius, lat, lon, filter) {
    let signs = await confirmedSignRepository.getSigns(radius, lat, lon, filter);
    let cluster1 = [];
    let cluster2 = [];
    let cluster3 = [];
    let cluster4 = [];
    signs.forEach(sign => {
        if (sign.lat >= lat) {
            if (sign.lon >= lon) {
                cluster2.push(getSignModel(sign));
            } else {
                cluster1.push(getSignModel(sign));
            }
        } else {
            if (sign.lon >= lon) {
                cluster4.push(getSignModel(sign));
            } else {
                cluster3.push(getSignModel(sign));
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