function isValidPhoneNumber(number) {
    let regexp = new RegExp('^(8|\\+7)\\d{10}$');
    return regexp.test(number);
}

module.exports = {
    isValidPhoneNumber
}