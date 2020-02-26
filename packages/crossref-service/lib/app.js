const config = require('config');

const indexRouter = require('./routes/index');
const articleMetadataRouter = require('./routes/article-metadata');
const searchArticlesRouter = require('./routes/search-articles');

module.exports = function(app) {
  app.use(
    crossref({
      agentName: config.agentName,
      agentVersion: config.agentVersion,
      mailTo: config.mailTo,
      rows: config.rows,
    }),
  );

  app.use('/', indexRouter);
  app.use('/article-metadata', articleMetadataRouter);
  app.use('/search-articles', searchArticlesRouter);

  return app;
};
