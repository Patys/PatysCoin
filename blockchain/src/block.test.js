const Block = require('./block');

// TODO: write tests
test('Create block from empty data', () => {
  const testBlock = new Block(0, '', '', {});
  expect(testBlock.index).toEqual(0);
});
