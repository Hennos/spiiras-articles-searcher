'use strict';

const axios = require('axios');
const { Model } = require('@articles-searcher/api-service');

class CrossrefModel extends Model {
  constructor(options = {}) {
    super(options);

    const { mailTo } = options.agent;
    if (!mailTo) {
      throw new TypeError('CrossrefModel: mailTo options if required');
    }

    const {
      agent: { name: agentName = 'CrossrefSearcher', version: agentVersion = '1.0.0' },
      ...modelOptions
    } = options;

    this.options = {
      baseUrl: 'https://api.crossref.org/works',
      allowedQuery: ['query', 'author', 'bibliographic', 'affiliation'],
      rows: 10,
      ...modelOptions,
    };

    this.userAgent = `${agentName}/${agentVersion} (mailto:${mailTo})`;
  }

  async findArticle(id) {
    try {
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
    } catch (error) {
      return null;
    }
  }

  async findArticles(searchQuery) {
    try {
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
    } catch (error) {
      return null;
    }
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
}

module.exports = {
  Model: CrossrefModel,
  createModel: modelOptions => {
    return new CrossrefModel(modelOptions);
  },
};
