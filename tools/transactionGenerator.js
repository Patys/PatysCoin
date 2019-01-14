const fs = require('fs');

const TransactionBuilder = require('../blockchain/src/transactionBuilder');

// from, to, amount, privateKey
const transaction = TransactionBuilder.createTransaction(
  '027153bbca40b9d426f102cde6525cc25616bb5c381098335cf3d2def244750ca4',
  '027153bbca40b9d426f102cde6525cc25616bb5c381098335cf3d2def244750ca4',
  2,
  'fb3f886482c78aa3b5d1ea7f25254f2104a78ecedef5d6e00c601b243758a380',
);

const fileName = 'transaction.txt';
const stream = fs.createWriteStream(fileName);

stream.once('open', () => {
  stream.write(JSON.stringify(transaction));
  stream.end();
});
