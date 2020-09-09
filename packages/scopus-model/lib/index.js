'use strict';

const axios = require('axios');
const { Model } = require('@articles-searcher/api-service');

class ScopusModel extends Model {
  constructor(options) {
    super(options);

    this.name = 'scopus';

    const { rows = 10, apiKey, ...modelOptions } = options;

    if (!apiKey) {
      throw new TypeError('ScopusModel: apiKey options if required');
    }

    this.apiKey = apiKey;

    this.options = {
      baseUrl: 'https://api.elsevier.com/content',
      allowedQuery: ['title', 'authors', 'keywords', 'affiliation'],
      rows,
      ...modelOptions,
    };

    this.setRoute('/affilations/*', async ({ params }) => {
      const doi = params[0];
      const affilations = await this.getArticleAffilations(doi);
      return affilations || 'No results';
    });
  }

  async findArticle(id) {
    const { baseUrl } = this.options;
    const command = `${baseUrl}/search/scopus?apiKey=${this.apiKey}&query=DOI("${id}")`;
    const { data } = await axios.get(command, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const metadata = data['search-results']['entry'][0];
    const issn = metadata['prism:issn'] || metadata['prism:eIssn'];

    if (issn) {
      const publisherQuartile = await this.getJournalQuartile(issn);
      metadata.publisherQuartile = `${publisherQuartile}`;
    }

    return metadata || false;
  }

  async findArticles(searchQuery) {
    const { baseUrl, rows } = this.options;
    const command = `${baseUrl}/search/scopus?apiKey=${
      this.apiKey
    }&count=${rows}&query=${this.encodeQuery(searchQuery)}`;
    const { data } = await axios.get(command, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const metadata = data['search-results']['entry'];
    return metadata || false;
  }

  async getArticleAffilations(id) {
    const article = await this.findArticle(id);

    const links = article['link'];

    if (!links) return null;

    const command =
      links.find(link => link['@ref'] === 'author-affiliation')['@href'] + `&apiKey=${this.apiKey}`;
    const { data } = await axios.get(command, {
      header: {
        'Content-Type': 'application/json',
      },
    });

    const affilations = data['abstracts-retrieval-response'];

    return affilations;
  }

  async getJournalQuartile(issn) {
    const { baseUrl } = this.options;
    const command = `${baseUrl}/serial/title/issn/${issn}?apiKey=${this.apiKey}`;
    const { data } = await axios.get(command, { 'Content-Type': 'application/json' });
    const serialTitleMetadata = data['serial-metadata-response']['entry'][0];
    const publisherPercentile = serialTitleMetadata.citeScoreYearInfoList.citeScoreCurrentMetric;

    if (!publisherPercentile) return false;

    return this.calcQuartile(publisherPercentile);
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

  calcQuartile(percentile) {
    return 4 - Math.floor((parseFloat(percentile) * 100) / 25);
  }
}

module.exports = {
  Model: ScopusModel,
  createModel: modelOptions => {
    return new ScopusModel(modelOptions);
  },
};
