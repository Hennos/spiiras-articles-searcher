"use strict";

const express = require("express");

const Model = require("./Model");

module.exports = createRouter;

function createRouter(model) {
  if (!(model instanceof Model)) {
    throw TypeError("TypeError (api-service): model must be instance of Model");
  }

  const router = express.Router();

  router.get("/", async function(req, res, next) {
    res.send("api-service");
  });

  router.get("/article-metadata/*", async function(req, res, next) {
    res.send("article-metadata");
  });

  router.get("/search-articles/*", async function(req, res, next) {
    res.send("search-articles");
  });

  return router;
}
