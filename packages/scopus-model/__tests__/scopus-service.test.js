'use strict';

const { expect } = require('chai');

const { Model, createModel } = require('../lib');

describe('scopus-service tests (with jest)', () => {
  describe('creating scopus-service instance', () => {
    it('create Model instance with factory method and options', () => {
      const options = {
        rows: 10,
        apiKey: 'apiKey',
      };

      const model = createModel(options);

      expect(model).to.be.instanceof(Model);
    });
  });
});
