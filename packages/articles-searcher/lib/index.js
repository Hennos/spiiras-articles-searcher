const { createService } = require('@articles-searcher/api-service');
const { createModel: createCrossrefModel } = require('@articles-searcher/crossref-model');
const { createModel: createScopusModel } = require('@articles-searcher/scopus-model');

function createSearcherService(app, config) {
  const crossrefModel = createCrossrefModel({
    rows: config.crossref.rows,
    agent: {
      name: config.crossref.agentName,
      version: config.crossref.agentVersion,
      mailTo: config.crossref.mailTo,
    },
  });
  createService(app, crossrefModel, '/crossref');

  const scopusModel = createScopusModel({
    rows: config.scopus.rows,
    apiKey: config.scopus.apiKey,
  });
  createService(app, scopusModel, '/scopus');
}

module.exports = { createSearcherService };
