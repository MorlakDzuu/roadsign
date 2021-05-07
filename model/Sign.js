const UnknownSign = require("./UnknownSign");

class Sign extends UnknownSign {
    constructor(id, coordinates, name, user_id, photo, address) {
        super(coordinates, user_id, photo, address);
        this.id = id;
        this.name = name;
    };

    static init(id, coordinates, name, user_id, photo, address, direction) {
        let sign = new Sign(id, coordinates, name, user_id, photo, address);
        this.id = id;
        this.name = name;
        this.direction = direction;
        return sign;
    }

    static initWithUnknownSign(unknownSign, id, name) {
        let sign = new Sign(id, unknownSign.coordinates, name,
            unknownSign.user_id, unknownSign.photo, unknownSign.address, unknownSign.direction);
        return sign;
    }

}

module.exports = Sign;