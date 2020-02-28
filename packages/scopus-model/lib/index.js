'use strict';

const axios = require('axios');
const { Model } = require('@searcher/api-service');

class ScopusModel extends Model {
  constructor(options) {
    super(options);

    const { apiKey = '', ...modelOptions } = options;

    this.apiKey = apiKey;

    this.options = {
      baseUrl: 'https://api.elsevier.com/content/search/scopus',
      allowedQuery: ['title', 'authors', 'keywords', 'affiliation'],
      rows: 10,
      ...modelOptions,
    };
  }

  async findArticle(id) {
    const { baseUrl } = this.options;
    const command = `${baseUrl}?apiKey=${this.apiKey}&query=DOI("${id}")`;
    const { data } = await axios.get(command, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const metadata = data['search-results']['entry'][0];
    return metadata || false;
  }

  async findArticles(searchQuery) {
    const { baseUrl, rows } = this.options;
    const command = `${baseUrl}?apiKey=${this.apiKey}&count=${rows}&query=${this.encodeQuery(
      searchQuery,
    )}`;
    const { data } = await axios.get(command, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const metadata = data['search-results']['entry'];
    return metadata || false;
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
      title: query => `TITLE("${query}")`,
      authors: query => `AUTHORS("${query}")`,
      keywords: query => `KEYWORDS("${query}")`,
      affiliation: query => `AFFIL("${query}")`,
    };
  }

  encodeQuery(searchQuery) {
    const queryScheme = this.mapQueryScheme();
    return encodeURI(
      Object.entries(this.filterAllowed(searchQuery))
        .map(([queryName, queryValue]) => {
          const mapQuery = queryScheme[queryName];
          return mapQuery(queryValue);
        })
        .join(' AND '),
    );
  }
}

module.exports = {
  Model: ScopusModel,
  createModel: modelOptions => {
    return new ScopusModel(modelOptions);
  },
};
