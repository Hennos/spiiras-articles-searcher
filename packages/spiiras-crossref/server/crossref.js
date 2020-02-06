const endpoint = 'https://api.crossref.org';
const userAgent = (name, version, mailto) => `${name}/${version} (mailto:${mailto})`;
const queryParams = [
  'query',
  'query.container-title',
  'query.author',
  'query.editor',
  'query.chair',
  'query.translator',
  'query.contributor',
  'query.bibliographic',
  'query.affiliation',
];

module.exports = function(options) {
  const {
    agentName = 'search-articles',
    agentVersion = '1.0.0',
    mailTo = 'gnomskg@gmail.com',
    rows = 10,
  } = options;

  const headers = {
    headers: {
      'User-Agent': userAgent(agentName, agentVersion, mailTo),
    },
  };

  return function(req, res, next) {
    req.crossref = {
      findArticleApiCall: (article = '') => ({
        url: `${endpoint}/works/${article}`,
        ...headers,
      }),
      findArticlesApiCall: (queryParams = {}) => ({
        url: `${endpoint}/works?rows=${rows}&${normalize(validate(queryParams))}`,
        ...headers,
      }),
    };
    next();
  };

  function validate(examinedQueryParams) {
    const validated = {};
    for ([paramKey, paramValue] of Object.entries(examinedQueryParams)) {
      if (queryParams.includes(paramKey)) {
        validated[paramKey] = paramValue;
      }
    }
    return validated;
  }

  function normalize(gettingQueryParams) {
    return Object.entries(validate(gettingQueryParams))
      .map(queryRow => encodeURI(queryRow.join('=')))
      .join('&');
  }
};
