const express = require('express');
const axios = require('axios');

const router = express.Router();

/* Search articles by queries */
router.get('/*', async function(req, res, next) {
  try {
    const { crossref } = req;
    const apiCall = crossref.findArticlesApiCall(req.query);
    const {
      data: { message: metadata },
    } = await axios.get(apiCall.url, {
      headers: apiCall.headers,
    });
    res.send(metadata);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(404);
  }
});

module.exports = router;
