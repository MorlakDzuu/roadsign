const UnknownSign = require("./UnknownSign");

class Sign extends UnknownSign {
    constructor(id, lat, lon, name, user_id, photo, address, direction) {
        super(lat, lon, user_id, photo, address, direction);
        this.id = id;
        this.name = name;
    };

    static init(id, lat, lon, name, user_id, photo, address, direction) {
        let sign = new Sign(id, lat, lon, name, user_id, photo, address, direction);
        this.id = id;
        this.name = name;
        return sign;
    }

    static initWithUnknownSign(unknownSign, id, name) {
        let sign = new Sign(id, unknownSign.lat, unknownSign.lon, name,
            unknownSign.user_id, unknownSign.photo, unknownSign.address, unknownSign.direction);
        return sign;
    }

}

module.exports = Sign;