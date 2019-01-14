
/**
 * mineBlock - Mines new block. Keep counting sha256 hash until difficulty is fine
 *
 * @param {object} block Block with all data
 * @param {number} difficulty Number of '0' (zeros) in string hash on the beginning
 */
function mine(block, difficulty) {
  const minedBlock = block;
  while (minedBlock.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
    minedBlock.nonce += 1;
    minedBlock.hash = minedBlock.calculateHash();
  }
  return minedBlock;
}

module.exports = {
  mine,
};
