const crypto = require('crypto');


/**
 * Generate a key
 * @param {String} hmacKey The hmac key, default to 'loopback'
 * @param {String} algorithm The algorithm, default to 'sha1'
 * @param {String} encoding The string encoding, default to 'hex'
 * @returns {String} The generated key
 */
function generateKey(hmacKey, algorithm, encoding) {
    if (!hmacKey) throw new Error(`${HMAC} key is required`);
    algorithm = algorithm || 'sha1';
    encoding = encoding || 'hex';
    var hmac = crypto.createHmac(algorithm, hmacKey);
    var buf = crypto.randomBytes(32);
    hmac.update(buf);
    var key = hmac.digest(encoding);
    return key;
}
  
module.exports = {
    generateKey: generateKey
};
