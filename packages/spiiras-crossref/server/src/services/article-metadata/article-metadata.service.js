// Initializes the `article-metadata` service on path `/article-metadata`
const { ArticleMetadata } = require('./article-metadata.class');
const hooks = require('./article-metadata.hooks');

module.exports = function(app) {
  const options = {
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/article-metadata', new ArticleMetadata(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('article-metadata');

  service.hooks(hooks);
};
