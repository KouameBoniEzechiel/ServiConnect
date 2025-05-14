require("dotenv").config();
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secretKey = process.env.FRONT_SECRET_KEY;

// Chiffrer l’objet
const ObjectToBase64 = function (user) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(JSON.stringify(user), 'utf8', 'hex');
    encrypted +=  cipher.final('hex');

    return iv.toString('hex') + encrypted;
}

const decryptData = function (encryptedCombined) {
  const ivHex = encryptedCombined.slice(0, 32); // 16 bytes en hex = 32 chars
  const encryptedHex = encryptedCombined.slice(32);

  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv); // même clé que pour le chiffrement
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

module.exports = {
    ObjectToBase64,
    decryptData
}