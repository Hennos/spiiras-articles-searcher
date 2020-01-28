const app = require('../../src/app');

describe("'article-metadata' service", () => {
  it('registered the service', () => {
    const service = app.service('article-metadata');
    expect(service).toBeTruthy();
  });
});
