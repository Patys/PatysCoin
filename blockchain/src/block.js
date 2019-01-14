const array = require('./utils/array');
const cryptoHelper = require('./utils/cryptoHelper');

/**
 * Block - Class for block structure
 */
class Block {
  /**
   * constructor - Creates new block
   *
   * @param {number} index        index of block, should be next index in blockchain array
   * @param {string} previousHash hash of previous block
   * @param {string} timestamp    timestamp of block
   * @param {array} data         array of data
   *
   * @returns {type} Nothing
   */
  constructor(index, previousHash, timestamp, data) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = array.flatten([data]);
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  /**
   * calculateHash - Creates sha256 hash from all fields of block
   *
   * @returns {string} Hash of block
   */
  calculateHash() {
    const data = this.index
    + this.previousHash
    + this.timestamp
    + JSON.stringify(this.data)
    + this.nonce;
    return cryptoHelper.getHash(data);
  }
}

module.exports = Block;
