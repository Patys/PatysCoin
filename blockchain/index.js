const Blockchain = require('./src/blockchain');
const P2P = require('./p2p');
const emitter = require('./eventEmitter');

const patyscoin = new Blockchain(emitter);
const p2p = new P2P(emitter, process.env.WS_PORT);

module.exports = {
  emitter,
  p2p,
  patyscoin,
};
