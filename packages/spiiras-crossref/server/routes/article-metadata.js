const express = require('express');
const axios = require('axios');

const router = express.Router();

/* GET article metadata by DOI. */
router.get('/*', async function(req, res, next) {
  try {
    const { crossref } = req;
    const article = req.params[0];
    if (article) {
      const apiCall = crossref.findArticleApiCall(article);
      const {
        data: { message: metadata },
      } = await axios.get(apiCall.url, {
        headers: apiCall.headers,
      });
      res.send(metadata);
    }
    res.sendStatus(400);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(404);
  }
});

module.exports = router;
