const express = require('express');
const axios = require('axios');
const config = require('config');

const router = express.Router();

/* GET home page. */
router.get('/*', async function(req, res, next) {
  try {
    const article = req.params[0];
    const url = `${config.crossref}/works/${article}`;
    const userAgent = `${config.agentName}/${config.agentVersion} (mailto:${config.mailTo})`;
    const {
      data: { message: metadata },
    } = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
      },
    });
    res.send(metadata);
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
