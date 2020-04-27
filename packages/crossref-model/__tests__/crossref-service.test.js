'use strict';

const https = require('https');
const { expect } = require('chai');

const { Model, createModel } = require('../lib');

describe('crossref-model tests', () => {
  describe('creating CrossrefModel instance', () => {
    it('create Model instance with factory method and options', () => {
      const options = {
        rows: 10,
        agent: {
          name: 'tested-app',
          version: 'tested-version',
          mailTo: 'tested@gmail.com',
        },
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

  // describe('calling CrossrefModel instance methods', () => {
  //   let model;

  //   before(done => {
  //     const options = {
  //       rows: 10,
  //       agent: {
  //         mailTo: 'gnomskg@gmail.com',
  //       },
  //     };

  //     model = createModel(options);

  //     done();
  //   });

  //   it('find article with findArticle method and valid article DOI', async () => {
  //     const id = '10.1080/18146627.2016.1227686';

  //     const response = await model.findArticle('1313');

  //     expect(response).not.to.be.NaN;
  //   });

  //   it('find articles with findArticles method and valid query params', async () => {
  //     const searchQuery = {
  //       author: 'Robert Martin',
  //     };

  //     const response = await model.findArticles(searchQuery);

  //     expect(response).not.to.be.NaN;
  //   });
  // });
});
