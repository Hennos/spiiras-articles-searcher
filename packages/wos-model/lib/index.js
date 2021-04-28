'use strict';

const axios = require('axios');
const { Model } = require('@articles-searcher/api-service');

class WOSModel extends Model {
  constructor(options) {
    super(options);

    this.name = 'wos';

    const { rows = 10, credentials, ...modelOptions } = options;

    if (!(credentials && credentials.username && credentials.password)) {
      throw new TypeError('WOSModel: invalid credentials');
    }

    this.credentials = credentials;

    this.options = {
      baseUrl: 'https://ws.isiknowledge.com/cps/xrpc',
      allowedQuery: ['title', 'author', 'authors', 'year', 'issn'],
      retrieve: [
        'doi',
        // 'title',
        // 'isbn',
        // 'issn',
        // 'issue',
        // 'vol',
        // 'year',
        // 'tpages',
        'ut',
        'timesCited',
        'sourceURL',
        'citingArticlesURL',
        'relatedRecordsURL',
      ],
      rows,
      ...modelOptions,
    };
  }

  async findArticle(id) {
    const { baseUrl, retrieve } = this.options;
    const reqBody = this.buildXmlRequest({
      credentials: this.credentials,
      retrieveValues: retrieve,
      searchQuery: {
        doi: id,
      },
    });
    const { data } = await axios.post(baseUrl, reqBody);
    return data || null;
  }

  async findArticles(searchQuery) {
    const { baseUrl, retrieve } = this.options;
    const reqBody = this.buildXmlRequest({
      credentials: this.credentials,
      retrieveValues: retrieve,
      searchQuery: this.formatSearchQuery(searchQuery),
    });
    const { data } = await axios.post(baseUrl, reqBody);
    return data || null;
  }

  formatSearchQuery(searchQuery) {
    const queryScheme = this.mapQueryScheme();
    const formatSearchQuery = {};
    Object.entries(this.filterAllowed(searchQuery)).forEach(([paramName, paramValue]) => {
      formatSearchQuery[queryScheme[paramName]] = paramValue;
    });
    return formatSearchQuery;
  }

  // TODO: Перенести в базовую модель
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
      title: 'atitle',
      author: 'author',
      authors: 'authors',
      year: 'year',
      issn: 'issn',
    };
  }

  buildXmlRequest({ credentials, retrieveValues, searchQuery }) {
    const { username, password } = credentials;
    const xmlCredentials = buildXml({
      tag: 'map',
      value: [
        {
          tag: 'val',
          value: username,
          props: {
            name: 'username',
          },
        },
        {
          tag: 'val',
          value: password,
          props: {
            name: 'password',
          },
        },
      ],
    });

    const xmlRetrieveList = retrieveValues.map(rVal => ({ tag: 'val', value: rVal }));
    const xmlRetrieveValues = buildXml({
      tag: 'map',
      value: {
        tag: 'list',
        props: { name: 'WOS' },
        value: xmlRetrieveList,
      },
    });

    const queryParams = Object.entries(searchQuery).map(([paramName, paramValue]) =>
      Array.isArray(paramValue)
        ? {
            tag: 'list',
            props: { name: paramName },
            value: paramValue.map(listElem =>
              buildXml({
                tag: 'val',
                value: listElem,
              }),
            ),
          }
        : {
            tag: 'val',
            props: { name: paramName },
            value: paramValue,
          },
    );
    const xmlQuery = buildXml({
      tag: 'map',
      props: { name: `cite_1` },
      value: queryParams,
    });
    const xmlLookupData = buildXml({
      tag: 'map',
      value: xmlQuery,
    });

    const xmlDetails = buildXml({
      tag: 'xml',
      props: { version: '1.0', encoding: 'UTF-8' },
    });

    const xmlRequest = buildXml({
      tag: 'request',
      props: { xmlns: 'http://www.isinet.com/xrpc42' },
      value: {
        tag: 'fn',
        props: { name: 'LinksAMR.retrieve' },
        value: {
          tag: 'list',
          value: [xmlCredentials, xmlRetrieveValues, xmlLookupData],
        },
      },
    });

    return `${xmlDetails}${xmlRequest}`;

    function buildXml({ tag, value = null, props = {} }) {
      if (value === null) {
        return xmlSelfClosingTag({ name: tag, props });
      }
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          const xmlValues = value
            .map(listElem => (typeof listElem === 'string' ? listElem : buildXml(listElem)))
            .join('');
          return xmlTag({ name: tag, value: xmlValues, props });
        }

        const xmlValue = buildXml(value);
        return xmlTag({ name: tag, value: xmlValue, props });
      }
      return xmlTag({ name: tag, value, props });
    }

    function xmlTag({ name, value, props = {} }) {
      const buildProps = Object.entries(props)
        .map(([propName, propValue]) => ` ${propName}="${propValue}"`)
        .join('');
      return `<${name}${buildProps}>${value}</${name}>`;
    }

    function xmlSelfClosingTag({ name, props = {} }) {
      const buildProps = Object.entries(props)
        .map(([propName, propValue]) => ` ${propName}="${propValue}"`)
        .join('');
      return `<?${name}${buildProps}?>`;
    }
  }
}

module.exports = {
  Model: WOSModel,
  createModel: modelOptions => {
    return new WOSModel(modelOptions);
  },
};
