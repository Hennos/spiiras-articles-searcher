const express = require('express');
const axios = require('axios');

const router = express.Router();

/* GET article metadata by DOI. */
router.get('/*', async function(req, res, next) {
  try {
    const { endpoint: crossrefEndpoint, headers: crossrefHeaders } = req.crossref;
    const article = req.params[0];
    if (article) {
      const url = `${crossrefEndpoint}/works/${article}`;
      const {
        data: { message: metadata },
      } = await axios.get(url, {
        headers: crossrefHeaders,
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
