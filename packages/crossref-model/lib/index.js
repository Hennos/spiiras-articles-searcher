'use strict';

const { Model } = require('@articles-searcher/api-service');

class CrossrefModel extends Model {
  constructor(options = {}) {
    super(options);

    this.name = 'crossref';

    const { mailTo } = options.agent;
    if (!mailTo) {
      throw new TypeError('CrossrefModel: mailTo options if required');
    }

    const {
      agent: { name: agentName = 'CrossrefSearcher', version: agentVersion = '1.0.0' },
      ...modelOptions
    } = options;

    this.userAgent = `${agentName}/${agentVersion} (mailto:${mailTo})`;

    this.options = {
      baseUrl: 'https://api.crossref.org/works',
      allowedQuery: ['query', 'author', 'bibliographic', 'affiliation'],
      rows: 10,
      ...modelOptions,
    };

    this.setRoute('/affiliations/*', async ({ params }) => {
      try {
        const doi = params[0];
        const affiliations = await this.getArticleAffiliations(doi);
        return affiliations;
      } catch (error) {
        if (error instanceof Model.DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });
  }

  async findArticle(id) {
    const { baseUrl } = this.options;
    const command = `${baseUrl}/${id}`;
    const response = await this.sendRequest(command, { headers: { 'User-Agent': this.userAgent } });
    return response.data.message;
  }

  async findArticles(searchQuery) {
    const { baseUrl, rows } = this.options;
    const command = `${baseUrl}?rows=${rows}&${this.encodeQuery(searchQuery)}`;
    const response = await this.sendRequest(command, { headers: { 'User-Agent': this.userAgent } });
    return response.data.message;
  }

  async getArticleAffiliations(id) {
    const article = await this.findArticle(id);
    const authorsWithAffiliation = this.parseArticleAffiliations(article);
    return authorsWithAffiliation;
  }

  filterAllowed(searchQuery) {
    const { allowedQuery } = this.options;
    const validated = {};
    Object.entries(searchQuery).forEach(([queryName, queryValue]) => {
      if (allowedQuery.includes(queryName)) {
        validated[queryName] = queryValue;
      }
    });
    return validated;
  }

  mapQueryScheme() {
    return {
      query: 'query',
      author: 'query.author',
      bibliographic: 'query.bibliographic',
    };
  }

  encodeQuery(searchQuery) {
    const mapQueryScheme = this.mapQueryScheme();
    return encodeURI(
      Object.entries(this.filterAllowed(searchQuery))
        .map(([queryName, queryValue]) => [mapQueryScheme[queryName], queryValue])
        .map(queryRow => queryRow.join('='))
        .join('&'),
    );
  }

  // В качестве элементов списка авторов присутствуют данные организаций с названием в поле name
  parseArticleAffiliations(article) {
    const contributors = article.author;
    const authors = contributors.filter(contributor => !!contributor.given);
    const affiliations = contributors.filter(contributor => !!contributor.name);
    const authorsWithAffiliation =
      affiliations.length === 0
        ? authors
        : authors.map((author, number) => {
            const affiliation =
              author.sequence === 'first'
                ? affiliations.find(affiliation => affiliation.sequence === 'first') || []
                : affiliations[number] || [];
            return { ...author, affiliation: [{ name: affiliation.name }] };
          });
    return authorsWithAffiliation;
  }
}

module.exports = {
  Model: CrossrefModel,
  createModel: modelOptions => {
    return new CrossrefModel(modelOptions);
  },
};
