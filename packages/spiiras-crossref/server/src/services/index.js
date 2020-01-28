const articleMetadata = require('./article-metadata/article-metadata.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(articleMetadata);
};
