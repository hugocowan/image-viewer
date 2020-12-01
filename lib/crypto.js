const crypto = require('crypto');

const algorithm = 'aes-256-ctr',
    secretKey = 'zyMA4NvbiYElqwOy4aA2T3bJv9X9qgl9',
    iv = crypto.randomBytes(16);

const encrypt = text => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv),
        encrypted = Buffer.concat([ cipher.update(text), cipher.final() ]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = hash => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex')),
        decrypted = Buffer.concat([ decipher.update(Buffer.from(hash.content, 'hex')), decipher.final() ]);

    return decrypted.toString();
};

module.exports = {
    encrypt,
    decrypt
};