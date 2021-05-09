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

async function getSignsCluster(radius, lat, lon, filter) {
    let signs = await confirmedSignRepository.getSigns(radius, lat, lon, filter);
    let cluster1 = [];
    let cluster2 = [];
    let cluster3 = [];
    let cluster4 = [];
    signs.forEach(sign => {
        if (sign.lat >= lat) {
            if (sign.lon >= lon) {
                cluster2.push(sign);
            } else {
                cluster1.push(sign);
            }
        } else {
            if (sign.lon >= lon) {
                cluster4.push(sign);
            } else {
                cluster3.push(sign);
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
    return {
        cluster1: {
            size: cluster1Size,
            signs: cluster1
        },
        cluster2: {
            size: cluster2Size,
            signs: cluster2
        },
        cluster3: {
            size: cluster3Size,
            signs: cluster3
        },
        cluster4: {
            size: cluster4Size,
            signs: cluster4
        }
    };
}

module.exports = {
    addSign,
    getSignsCluster
}