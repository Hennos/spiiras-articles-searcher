const config = require('config');

const endpoint = config.crossref;
const userAgent = (name, version, mailto) => `${name}/${version} (mailto:${mailto})`;
const queryParams = {
  query: 'query',
  queryContainerTitle: 'query.container-title',
  queryAuthor: 'query.author',
  queryEditor: 'query.editor',
  queryChair: 'query.chair',
  queryTranslator: 'query.translator',
  queryContributor: 'query.contributor',
  queryBibliographic: 'query.bibliographic',
  queryAffiliation: 'query.affiliation',
};

module.exports = function(options) {
  const {
    agentName = 'search-articles',
    agentVersion = '1.0.0',
    mailTo = 'gnomskg@gmail.com',
    rows = 10,
  } = options;

  return function(req, res, next) {
    req.crossref = {
      endpoint,
      headers: {
        'User-Agent': userAgent(agentName, agentVersion, mailTo),
      },
      queryParams,
      rows,
    };
    next();
  };
};
