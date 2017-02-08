var crypto = require('crypto-js');

var securityHelper = {
	
	encrypt : (value, secret) => {

        let key;
        if (typeof value != 'string') {
            key = JSON.stringify(value);
        } else {
            key = value;
        }

        var ciphertext = crypto.AES.encrypt(key, secret);
        return ciphertext.toString();
	},

    decrypt : (value, secret) => {

        var bytes  = crypto.AES.decrypt(value, secret);
        return bytes.toString(crypto.enc.Utf8);
    }
}

module.exports = securityHelper