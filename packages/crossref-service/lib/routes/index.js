const express = require('express');
const axios = require('axios');
const config = require('config');

const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.send('Get article by doi of search articles by filter params');
});

module.exports = router;
