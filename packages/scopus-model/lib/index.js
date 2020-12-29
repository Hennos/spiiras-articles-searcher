'use strict';

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

    this.setRoute('/citing', async ({ query }) => {
      const { doi, start = 0 } = query;
      try {
        const citing = await this.getCitingArticles(doi, start);
        return citing;
      } catch (error) {
        if (error instanceof Model.DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });
    this.setRoute('/affiliations/*', async ({ params }) => {
      const doi = params[0];
      try {
        const affiliations = await this.getArticleAffiliations(doi);
        return affiliations;
      } catch (error) {
        if (error instanceof Model.DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });
    this.setRoute('/full/affiliations/*', async ({ params }) => {
      const doi = params[0];
      try {
        const affiliations = await this.getArticleAffiliations(doi, true);
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

    const command = `${baseUrl}/search/scopus?apiKey=${this.apiKey}&query=DOI("${id}")`;
    const { data } = await this.sendRequest(command, {
      headers: { 'Content-Type': 'application/json' },
    });

    const searchResult = data['search-results'];
    if (searchResult['opensearch:totalResults'] === '0') {
      throw new Model.DataServiceError({
        message: 'В базе данных SCOPUS не найдена искомая статья',
        status: Model.DataServiceError.statusCodes.DATA_API_NOT_FOUND_DATA,
      });
    }

    const metadata = searchResult['entry'][0];
    const issn = metadata['prism:issn'] || metadata['prism:eIssn'];
    if (issn) {
      const publisherQuartile = await this.getJournalQuartile(issn);
      metadata.publisherQuartile = publisherQuartile;
    }

    return metadata;
  }

  async findArticles(searchQuery) {
    const { baseUrl, rows } = this.options;
    const encodedSearchQuery = this.encodeQuery(searchQuery);
    const command = `${baseUrl}/search/scopus?apiKey=${this.apiKey}&count=${rows}&query=${encodedSearchQuery}`;
    const { data } = await this.sendRequest(command, {
      headers: { 'Content-Type': 'application/json' },
    });
    const metadata = data['search-results']['entry'];
    return metadata;
  }

  async getCitingArticles(id, start) {
    const { baseUrl, rows } = this.options;

    const citedArticle = await this.findArticle(id);

    if (!citedArticle) return null;

    const citedArticleTitle = citedArticle['dc:title'];
    const fields = 'prism:doi,prism:coverDate,author';
    const command = `${baseUrl}/search/scopus?apiKey=${this.apiKey}&count=${rows}&start=${start}&fields=${fields}&query=reftitle(${citedArticleTitle})`;
    const { data } = await this.sendRequest(command, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const citing = {
      totalResults: data['search-results']['opensearch:totalResults'],
      startIndex: data['search-results']['opensearch:startIndex'],
      itemsPerPage: data['search-results']['opensearch:itemsPerPage'],
      entry: data['search-results']['entry'],
    };

    return citing;
  }

  async getArticleAffiliations(id, full = false) {
    const { baseUrl } = this.options;
    const command = `${baseUrl}/abstract/doi/${id}?apiKey=${this.apiKey}`;
    const { data } = await this.sendRequest(command, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const authorsAffiliationsResponse = data['abstracts-retrieval-response'];
    const articleAffiliationsRetrievalList = authorsAffiliationsResponse.affiliation;
    if (!authorsAffiliationsResponse.authors) return articleAffiliationsRetrievalList;
    const authorsRetrievalList = authorsAffiliationsResponse.authors.author;

    const articleCompleteAffiliationsList = await Promise.all(
      articleAffiliationsRetrievalList.map(async affiliation => {
        let affiliationData = null;
        if (full) {
          affiliationData = await this.getFullAffiliations(affiliation);
        } else {
          affiliationData = affiliation;
        }
        return { id: affiliation['@id'], data: affiliationData };
      }),
    );

    const authorsCompleteAffilationsList = authorsRetrievalList.map(author => {
      const { affiliation: authorAffiliations, ...authorData } = author;

      let authorCompleteAffiliationsList = null;
      if (Array.isArray(authorAffiliations)) {
        authorCompleteAffiliationsList = authorAffiliations.map(authorAffiliation => {
          const authorCompleteAffiliations = articleCompleteAffiliationsList.find(
            fullAffiliation => fullAffiliation.id === authorAffiliation['@id'],
          );
          return authorCompleteAffiliations.data;
        });
      } else {
        const authorCompleteAffiliations = articleCompleteAffiliationsList.find(
          fullAffiliation => fullAffiliation.id === authorAffiliations['@id'],
        );
        authorCompleteAffiliationsList = [authorCompleteAffiliations.data];
      }

      return {
        affiliation: authorCompleteAffiliationsList,
        ...authorData,
      };
    });

    return authorsCompleteAffilationsList;
  }

  async getJournalQuartile(issn) {
    try {
      const { baseUrl } = this.options;
      const command = `${baseUrl}/serial/title/issn/${issn}?apiKey=${this.apiKey}`;
      const { data } = await this.sendRequest(command, {
        headers: { 'Content-Type': 'application/json' },
      });

      const serialTitleMetadata = data['serial-metadata-response']['entry'][0];
      const publisherPercentile = serialTitleMetadata.citeScoreYearInfoList.citeScoreCurrentMetric;

      if (!publisherPercentile) return false;

      return this.calcQuartile(publisherPercentile);
    } catch (error) {
      return false;
    }
  }

  async getFullAffiliations(affiliation) {
    const command = affiliation['@href'] + `?apiKey=${this.apiKey}`;
    const { data } = await this.sendRequest(command, {
      headers: { 'Content-Type': 'application/json' },
    });
    return { id: affiliation['@id'], data: data['affiliation-retrieval-response'] };
  }

  filterAllowed(searchQuery) {
    const { allowedQuery } = this.options;
    const validated = {};
    Object.entries(searchQuery).forEach(([queryName, queryValue]) => {
      if (allowedQuery.includes(queryName)) validated[queryName] = queryValue;
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
    return 4 - Math.floor(parseFloat(percentile) / 25);
  }
}

module.exports = {
  Model: ScopusModel,
  createModel: modelOptions => {
    return new ScopusModel(modelOptions);
  },
};
