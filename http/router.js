// const p2p = require('../blockchain/p2p');
// const patyscoin = require('../blockchain');
// require('../blockchain/p2pBridge').init();
const { patyscoin, p2p } = require('../blockchain');

const transaction = '{"id":"48add42d3958b4ae0426684a3a7daeb419221131a010e1f3e3140200a4fbcd8e","data":{"from":"027153bbca40b9d426f102cde6525cc25616bb5c381098335cf3d2def244750ca4","to":"027153bbca40b9d426f102cde6525cc25616bb5c381098335cf3d2def244750ca4","amount":2},"sign":"3045022100a76a8031013009cd43fe9e1cb1ddb1ff8b20e089a54328c648e19aa7f91345bf02203ccf81512f40582f20c9009350a048cedf1f9f041d717eff64bd957a07af3d99","hash":"1d630f8112082fd5e9567aaf6e8fe0974f02ec2954b88f638871c37cc5fc119a"}';
const { fromJSON } = require('../blockchain/src/transactionBuilder');

setInterval(() => {
  p2p.broadcast({ type: 'SYNC', data: JSON.stringify(patyscoin.blockchain) });
}, 5000);

function router(app) {
  app.get('/', (req, res) => {
    res.send(`numberOfBlocks: ${patyscoin.blockchain.length}<br>difficulty: ${patyscoin.difficulty},`);
  });
  app.get('/connect/:address', (req, res) => {
    p2p.addNewConnection(req.params.address);
    res.redirect('/');
  });
  app.get('/block/:blockNr', (req, res) => res.json(patyscoin.blockchain[req.params.blockNr]));
  app.get('/transactions', (req, res) => res.json(patyscoin.transactions));
  app.get('/test', (req, res) => {
    p2p.broadcast({ type: 'TRANSACTION', data: transaction });
    patyscoin.addTransaction(fromJSON(JSON.parse(transaction)));
    res.redirect('/');
  });
  app.get('/mine', (req, res) => {
    const block = patyscoin.mineNewBlock();
    patyscoin.addBlock(block);
    res.redirect('/');
  });
  app.get('/new/transaction', (req, res) => {
    res.sendFile(`${__dirname}/public/transaction.html`);
  });

  app.post('/new/transaction', (req, res) => {
    try {
      const t = JSON.parse(req.body.transaction);
      p2p.broadcast({ type: 'TRANSACTION', data: t });
      patyscoin.addTransaction(fromJSON(JSON.parse(t)));
      res.send('ok');
    } catch (e) {
      res.send(JSON.stringify(e));
    }
  });
}

module.exports = router;
