const fs = require('fs');

const CryptoHelper = require('../blockchain/src/utils/cryptoHelper');

const wallet = CryptoHelper.generateWallet();

const fileName = `wallet-${new Date().toISOString()}.txt`;
const stream = fs.createWriteStream(fileName);

stream.once('open', () => {
  stream.write(`Public key: ${wallet.publicKey}\n`);
  stream.write(`Private key: ${wallet.privateKey}\n`);
  stream.end();
});
