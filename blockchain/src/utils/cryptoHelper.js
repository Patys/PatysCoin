const secp256k1 = require('secp256k1');
const crypto = require('crypto');

const generateWallet = () => {
  // generate privateKey
  let privateKey;
  do {
    privateKey = crypto.randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privateKey));

  // generate publicKey
  const publicKey = secp256k1.publicKeyCreate(privateKey);

  return { publicKey: publicKey.toString('hex'), privateKey: privateKey.toString('hex') };
};

const sign = (data, privateKey) => {
  const hashedData = crypto.createHash('sha256').update(JSON.stringify(data)).digest().toString('hex');
  const signedMsg = secp256k1.sign(Buffer.from(hashedData, 'hex'), Buffer.from(privateKey, 'hex'));

  if (signedMsg) {
    return secp256k1.signatureExport(signedMsg.signature).toString('hex');
  }
  return null;
};

const verify = (data, signature, publicKey) => {
  const newSign = secp256k1.signatureImport(Buffer.from(signature, 'hex'));
  return secp256k1.verify(Buffer.from(data, 'hex'), newSign, Buffer.from(publicKey, 'hex'));
};

const randomHash = () => crypto.randomBytes(32).toString('hex');


/**
 * getHash - calculate sha256 hash from given data
 *
 * @param {string} data Data to calculate hash
 *
 * @returns {string} hex code for sha256 hash
 */
const getHash = data => crypto
  .createHash('sha256')
  .update(data)
  .digest()
  .toString('hex');


module.exports = {
  generateWallet,
  sign,
  verify,
  randomHash,
  getHash,
};
