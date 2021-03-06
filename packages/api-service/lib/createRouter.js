'use strict';

const express = require('express');

const Model = require('./Model');

function createRouter(model) {
  if (!(model instanceof Model)) {
    throw new TypeError('TypeError (api-service): model must be instance of Model');
  }

  const router = express.Router();

  router.get('/', async function(req, res, next) {
    res.send(model.getStatus(req));
  });

  model.routes.forEach(({ path, action }) => {
    router.get(path, async function(req, res, next) {
      try {
        const { params, query } = req;
        const result = await action({ params, query });

        if (result === null) res.status(404).send('Not found');

        if (result) res.send(result);
      } catch (error) {
        res.status(500);
        res.send(error.message);
      }
    });
  });

  return router;
}

module.exports = createRouter;
