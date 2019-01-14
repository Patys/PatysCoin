const WebSocketServer = require('ws').Server;
const WebSocket = require('ws');

class P2P {
  constructor(emitter, port) {
    this.emitter = emitter;
    this.registerEvents();

    this.sockets = [];
    this.addresses = [];
    this.server = new WebSocketServer({ port });
    this.initServer();
  }

  registerEvents() {
    this.emitter.on('broadcastNewTransaction', (data) => {
      this.broadcast({ type: 'TRANSACTION', data });
    });

    this.emitter.on('broadcastNewBlock', (data) => {
      this.broadcast({ type: 'BLOCK', data });
    });

    this.emitter.on('broadcast', (data) => {
      this.broadcast(data);
    });
  }

  initServer() {
    this.server.on('connection', (ws) => {
      this.initConnection(ws);
    });
    // eslint-disable-next-line
    this.server.on('error', (err) => console.log('Error srv', err));
  }

  initConnection(ws, url = null) {
    this.sockets.push(ws);

    this.handleMessages(ws);
    this.handleErrors(ws);
    // send information about another servers
    this.send(ws, { type: 'SOCKETS', addresses: this.addresses });
    if (url) this.addresses.push(url);
  }

  // eslint-disable-next-line class-methods-use-this
  send(ws, message) {
    ws.send(JSON.stringify(message));
  }

  broadcast(message) {
    this.sockets.forEach(socket => this.send(socket, message));
  }

  removeConnection(ws) {
    this.sockets.splice(this.sockets.indexOf(ws), 1);
  }

  handleErrors(ws) {
    ws.on('close', () => this.removeConnection(ws));
    ws.on('error', () => this.removeConnection(ws));
  }

  handleMessages(ws) {
    /*
    { type: 'MESSAGE', data: string }
    { type: 'SOCKETS', addresses: array }
    */
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      let newConnections = [];
      switch (message.type) {
        case 'TRANSACTION':
          this.emitter.emit('newTransaction', message.data);
          break;
        case 'BLOCK':
          this.emitter.emit('newBlock', message.data);
          break;
        case 'SOCKETS':
          newConnections = message.addresses.filter(add => !this.addresses.includes(add));
          newConnections.forEach((con) => {
            this.addNewConnection(con);
          });
          break;
        case 'SYNC':
          this.emitter.emit('synchronizeBlockchain', message.data);
          break;
        default:
          break;
      }
    });
  }

  addNewConnection(url) {
    const ws = new WebSocket(`ws://${url}/`, {
      rejectUnauthorized: false,
    });
    // eslint-disable-next-line
    ws.on('open', () => this.initConnection(ws, `ws://${url}/`));
    // eslint-disable-next-line
    ws.on('error', (err) => console.log('Connection failed. Addr: ', `ws://${url}/`, err));
  }
}

module.exports = P2P;
