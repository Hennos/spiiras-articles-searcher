const express = require('express');
const axios = require('axios');

const router = express.Router();

/* Search articles by queries */
router.get('/*', async function(req, res, next) {
  try {
    const {
      endpoint: crossrefEndpoint,
      headers: crossrefHeaders,
      queryParams: crQueryParams,
      rows: resultRows,
    } = req.crossref;
    const findRequest = Object.entries(crQueryParams)
      .map(([cfQueryKey, cfQueryParam]) => {
        const queryValue = req.query[cfQueryKey];
        return queryValue ? [cfQueryParam, queryValue] : false;
      })
      .filter(queryRow => !!queryRow)
      .map(queryRow => encodeURI(queryRow.join('=')))
      .join('&');
    const url = `${crossrefEndpoint}/works?rows=${resultRows}&${findRequest}`;
    const {
      data: { message: metadata },
    } = await axios.get(url, {
      headers: {
        'User-Agent': crossrefHeaders,
      },
    });
    res.send(metadata);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(404);
  }
});

module.exports = router;
