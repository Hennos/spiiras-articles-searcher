'use strict';

const createRouter = require('./createRouter');

function createService(app, model, route = 'metadata') {
  if (!app) {
    throw new Error('ArgumentError (api-service): app must passed in arguments');
  }
  if (!model) {
    throw new Error('ArgumentError (api-service): model must passed in arguments');
  }

  app.use(`${route}`, createRouter(model));

  return app;
}

module.exports = createService;
