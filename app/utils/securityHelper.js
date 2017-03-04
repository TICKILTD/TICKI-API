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
    }, 

    generateSecret : () => {
        var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
        var pass = "";
        var length = 40;

        for (var x = 0; x < length; x++) {
            var i = Math.floor(Math.random() * chars.length);
            pass += chars.charAt(i);
        }

        return pass;
    } 
}

module.exports = securityHelper