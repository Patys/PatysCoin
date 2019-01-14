const CryptoHelper = require('./cryptoHelper');

const privateKeyLength = 64;
const publicKeyLength = 66;

test('Generate new wallet', () => {
  const wallet = CryptoHelper.generateWallet();
  expect(wallet).toBeDefined();
  expect(wallet.publicKey.length).toBe(publicKeyLength);
  expect(wallet.privateKey.length).toBe(privateKeyLength);
});

test('Sign test', () => {
  const wallet = CryptoHelper.generateWallet();
  const data = { test: 'test' };
  const signedData = CryptoHelper.sign(data, wallet.privateKey);
  expect(wallet).toBeDefined();
  expect(wallet.privateKey.length).toBe(privateKeyLength);
  expect(signedData).toBeDefined();
});

test('getHash function test', () => {
  const data = { test: 'test' };
  const stringifiedData = JSON.stringify(data);
  const hash = CryptoHelper.getHash(stringifiedData);
  const expectedHash = '3e80b3778b3b03766e7be993131c0af2ad05630c5d96fb7fa132d05b77336e04';

  expect(hash).toEqual(expectedHash);
});
