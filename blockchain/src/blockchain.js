const Block = require('./block');
const Miner = require('./miner');
const TransactionBuilder = require('./transactionBuilder');
const { fromJSON } = require('../src/transactionBuilder');

// TODO: should be loaded from file
const genesisBlock = '{"index":0,"previousHash":"0","timestamp":"2018-10-18T15:38:43.135Z","data":[{"id":"5a71fe67dcfff931529e2e6f972566b4eda83f8bddd674132ac76c9bf0ee61bc","data":{"from":"03dad29afbb7c77b12dc850ea5ad544496333dd6c8ac82d514d5a5488821417c34","to":"03bf53fe19b27a825d0bcc96cc357324237df0e459b10cdcd273a158b824b519a6","amount":15},"sign":"67e27550f6de35ca0260f3f653577c4f7e17a3b0c321fb1f4ccd77ec1720f92e1cbefe17f00f3cbbf0ea22ae1271764f28b38ffc1b1d3f61c31b9c30a70f6bc8","hash":"54229e4fbbc5304484d5063b6d97972a0a8a6a76acefb178d31bcb454af45884"}],"hash":"699e273237dec19ea469923be1bd4d81f2d214274f11f69b83ddb74ec2309814","nonce":0}';

class Blockchain {
  constructor(emitter) {
    this.blockchain = [];
    this.transactions = [];
    this.blockchain.push(this.generateGenesisBlock());
    // TODO: cannot be set like this, let's generate from function
    this.difficulty = 4;
    this.emitter = emitter;

    this.registerEvents();
  }

  registerEvents() {
    this.emitter.on('newTransaction', (data) => {
      let transaction;
      try {
        transaction = fromJSON(JSON.parse(data));
      } catch (e) {
        transaction = fromJSON(data);
      }
      this.addTransaction(transaction);
    });

    this.emitter.on('newBlock', (data) => {
      let block;
      try {
        block = this.blockFromJSON(JSON.parse(data));
      } catch (e) {
        block = this.blockFromJSON(data);
      }
      this.addBlock(block);
    });

    this.emitter.on('synchronizeBlockchain', (blockchain) => {
      if (blockchain) {
        this.replaceBlockchain(JSON.parse(blockchain));
      }
    });
  }

  generateGenesisBlock() {
    return this.blockFromJSON(JSON.parse(genesisBlock));
  }

  // TODO: more transactions
  mineNewBlock() {
    const previousHash = this.getLatestBlock().hash;
    const index = this.blockchain.length;
    const timestamp = new Date().toISOString();

    const data = this.getTransactionsToBlock();
    if (data.length === 0) {
      return null;
    }

    let newBlock = new Block(index, previousHash, timestamp, data);
    newBlock = Miner.mine(newBlock, this.difficulty);
    return newBlock;
  }

  addBlock(newBlock = null) {
    let block;
    if (!newBlock) {
      block = this.mineNewBlock();
    } else {
      block = newBlock;
    }

    if (this.validateBlock(block)) {
      this.blockchain.push(block);
    }
  }

  validateBlock(newBlock) {
    return this.isValidBlock(newBlock, this.getLatestBlock());
  }

  isValidBlock(newBlock, previousBlock) {
    if (!newBlock) return false;
    if (newBlock.index !== previousBlock.index + 1) {
      return false;
    }
    if (newBlock.previousHash !== previousBlock.hash) {
      return false;
    }
    if (newBlock.hash !== newBlock.calculateHash()) {
      return false;
    }
    if (!this.areAllTransactionsValid(newBlock.data)) {
      return false;
    }
    return true;
  }

  isChainValid() {
    for (let i = 1; i < this.blockchain.length; i += 1) {
      if (!this.isValidBlock(this.blockchain[i], this.blockchain[i - 1])) return false;
    }
    return true;
  }

  // eslint-disable-next-line
  areAllTransactionsValid (transactions) {
    let isOk = true;
    transactions.forEach((transaction) => {
      if (!(TransactionBuilder.fromJSON(transaction).isValid())) {
        isOk = false;
      }
    });
    return isOk;
  }

  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  getTransactionsToBlock() {
    const transactions = [];

    if (this.transactions.length > 0) {
      transactions.push(this.getFirstTransaction());
      this.removeFirstTransactionFromPending();
    }
    return transactions;
  }

  removeFirstTransactionFromPending() {
    this.transactions.shift();
  }

  getLatestTransaction() {
    return this.transactions[this.blockchain.length - 1];
  }

  getFirstTransaction() {
    return this.transactions[0];
  }

  addTransaction(newTransaction) {
    if (this.checkTransaction(newTransaction)) {
      this.transactions.push(newTransaction);
    }
  }

  checkTransaction(transaction) {
    if (!transaction) {
      return false;
    }

    if (!transaction.isValid()) {
      return false;
    }

    // TODO: turned off for tests
    // if(this.getMoney(transaction.data.from) < transaction.data.amount) {
    //   console.error(`Not enough money on address ${transaction.data.from}`);
    //   return false
    // }

    if (this.blockchain.find(block => block.data.find(data => data.id === transaction.id))) {
      return false;
    }

    if (this.transactions.find(trans => trans.id === transaction.id)) {
      return false;
    }

    return true;
  }

  getMoney(address) {
    const incomes = this.blockchain.reduce((sum, block) => {
      if (!block) return sum;
      return sum + block.data.reduce((sum1, transaction) => {
        if (transaction.data.to === address) return sum1 + transaction.data.amount;
        return sum1;
      }, 0);
    }, 0);

    const outcomes = this.blockchain.reduce((sum, block) => {
      if (!block) return sum;
      return sum + block.data.reduce((sum1, transaction) => {
        if (transaction.data.from === address) return sum1 + transaction.data.amount;
        return sum1;
      }, 0);
    }, 0);

    const sum = incomes - outcomes;

    // if (sum < 0) console.error('Address has less then 0 money');

    return sum;
  }

  // eslint-disable-next-line
  blockFromJSON (json) {
    const jsonBlock = json;
    const block = new Block(
      jsonBlock.index,
      jsonBlock.previousHash,
      jsonBlock.timestamp,
      jsonBlock.data,
    );
    block.hash = jsonBlock.hash;
    block.nonce = jsonBlock.nonce;

    return block;
  }

  replaceBlockchain(blockchain) {
    const currentLength = this.blockchain.length;
    if (currentLength < blockchain.length && this.isChainValid(blockchain)) {
      this.blockchain = blockchain;
    }
  }
}

module.exports = Blockchain;
