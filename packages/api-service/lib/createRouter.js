"use strict";

const express = require("express");

const Model = require("./Model");

function createRouter(model) {
  if (!(model instanceof Model)) {
    throw new TypeError(
      "TypeError (api-service): model must be instance of Model"
    );
  }

  const router = express.Router();

  router.get("/", async function(req, res, next) {
    res.send("api-service");
  });

  router.get("/article/*", async function(req, res, next) {
    try {
      const article = req.params[0];
      const foundArticle = await model.findArticle(article);
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  });

  router.get("/articles", async function(req, res, next) {
    try {
      const searchQuery = req.query;
      const foundArticles = await model.findArticles(searchQuery);
      if (foundArticles) {
        res.send(foundArticles);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createRouter;
