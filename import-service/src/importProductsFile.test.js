const importProductsFile = require('./importProductsFile');

describe('importProductsFile', () => {

  test('should return an object', async () => {
    const response = await importProductsFile.handler();

    expect(typeof response).toBe('object');
  });
});
