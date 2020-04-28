'use strict';

const { expect } = require('chai');

const { Model, createModel } = require('../lib');

describe('wos-model tests', () => {
  describe('creating WOSModel instance', () => {
    it('create Model instance with factory method and options', () => {
      const options = {
        rows: 10,
        apiKey: 'apiKey',
      };

      const model = createModel(options);

      expect(model).to.be.instanceof(Model);
    });

    it('create Model instance with factory method without options throw error', () => {
      expect(() => createModel()).to.throw();
    });

    it('create Model instance with factory method without mailTo options throw TypeError', () => {
      expect(() => createModel()).to.throw(TypeError);
    });
  });
});
