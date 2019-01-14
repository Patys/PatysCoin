const cryptoHelper = require('./utils/cryptoHelper');

class Transaction {
  construct() {
    this.id = null; // as a hash
    this.hash = null; // hash
    this.sign = null;
    this.data = null; // transaction
  }

  calculateHash() {
    const data = JSON.stringify(this.id + this.sign + JSON.stringify(this.data));
    return cryptoHelper.getHash(data);
  }

  isValid() {
    if (!this.id || !this.hash || !this.sign || !this.data) {
      return false;
    }
    if (this.hash !== this.calculateHash()) {
      return false;
    }

    const hashedData = cryptoHelper.getHash(JSON.stringify(this.data));
    if (!cryptoHelper.verify(hashedData, this.sign, this.data.from)) {
      return false;
    }
    return true;
  }
}

module.exports = Transaction;
