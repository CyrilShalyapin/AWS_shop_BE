const catalogBatchProcess = require('./catalogBatchProcess');

describe('catalogBatchProcess', () => {

  test('should return an object', async () => {
    const response = await catalogBatchProcess.handler();

    expect(typeof response).toBe('object');
  });
});
