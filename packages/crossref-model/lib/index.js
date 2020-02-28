'use strict';

const axios = require('axios');
const { Model } = require('@searcher/api-service');

class CrossrefModel extends Model {
  constructor(options = {}) {
    super(options);

    const {
      agent: {
        name: agentName = 'articles-searcher',
        version: agentVersion = '1.0.0',
        mailTo = 'gnomskg@gmail.com',
      },
      ...modelOptions
    } = options;

    this.options = {
      baseUrl: 'https://api.crossref.org/works',
      allowedQuery: ['query', 'author', 'bibliographic'],
      rows: 10,
      ...modelOptions,
    };

    this.userAgent = `${agentName}/${agentVersion} (mailto:${mailTo})`;
  }

  async findArticle(id) {
    const { baseUrl } = this.options;
    const command = `${baseUrl}/${id}`;
    const {
      data: { message: metadata },
    } = await axios.get(command, {
      headers: {
        'User-Agent': this.userAgent,
      },
    });
    return metadata;
  }

  async findArticles(searchQuery) {
    const { baseUrl, rows } = this.options;
    const command = `${baseUrl}?rows=${rows}&${this.encodeQuery(searchQuery)}`;
    const {
      data: { message: metadata },
    } = await axios.get(command, {
      headers: {
        'User-Agent': this.userAgent,
      },
    });
    return metadata;
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
        .map(queryRow => encodeURI(queryRow.join('=')))
        .join('&'),
    );
  }
}

module.exports = {
  Model: CrossrefModel,
  createModel: modelOptions => {
    return new CrossrefModel(modelOptions);
  },
};
