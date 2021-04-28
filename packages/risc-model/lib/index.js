'use strict';

const xml2js = require('xml2js');

const { Model } = require('@articles-searcher/api-service');

class RISCModel extends Model {
  constructor(options = {}) {
    super(options);

    this.name = 'risc';

    const { userCode, ...modelOptions } = options;

    if (!userCode) {
      throw new TypeError('RISCModel: userCode options if required');
    }

    this.userCode = userCode;

    this.options = {
      baseUrl: 'http://elibrary.ru/projects/API-NEB/API_NEB.aspx',
      allowedQuery: {
        articles: ['authorid', 'titleid', 'orgid', 'year'],
        authors: [
          'spin',
          'authorid',
          'name',
          'lastName',
          'firstName',
          'initials',
          'country',
          'countryCode',
          'city',
          'orgName',
        ],
      },
      ...modelOptions,
    };

    this.sidTypes = {
      GET_ITEMS: '011',
      GET_AUTHORS: '013',
      FIND_AUTHOR: '018',
      GET_AUTHOR_METADATA: '024',
      GET_ITEM_METADATA: '026',
    };

    const parser = new xml2js.Parser({
      explicitCharkey: 'text',
      explicitRoot: false,
      explicitArray: false,
      mergeAttrs: true,
    });
    this.parseXmlString = parser.parseStringPromise;

    this.setRoute('/orgAuthors/*', async ({ params }) => {
      try {
        const orgid = params[0];
        const authors = await this.findOrgAuthors(orgid);
        return authors;
      } catch (error) {
        if (error instanceof DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });

    this.setRoute('/author/*', async ({ params }) => {
      try {
        const authorid = params[0];
        const author = await this.findAuthor(authorid);
        return author;
      } catch (error) {
        if (error instanceof DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });

    this.setRoute('/authors', async ({ query }) => {
      try {
        const authors = await this.findAuthors(query);
        return authors;
      } catch (error) {
        if (error instanceof DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });
  }

  async findArticle(id) {
    const userCode = this.userCode;
    const sid = this.sidTypes.GET_ITEM_METADATA;
    const { baseUrl } = this.options;
    const command = `${baseUrl}?ucode=${userCode}&sid=${sid}&itemid=${id}`;
    const { data } = await this.sendRequest(command);
    const jsonData = await this.parseXmlString(data);
    return jsonData;
  }

  async findArticles(searchQuery) {
    const userCode = this.userCode;
    const sid = this.sidTypes.GET_ITEMS;
    const { baseUrl } = this.options;
    const requestQuery = this.encodeArticlesQuery(searchQuery);
    const command = `${baseUrl}?ucode=${userCode}&sid=${sid}&${requestQuery}`;
    const { data } = await this.sendRequest(command);
    const jsonData = await this.parseXmlString(data);
    return jsonData;
  }

  async findOrgAuthors(orgid) {
    const userCode = this.userCode;
    const sid = this.sidTypes.GET_AUTHORS;
    const { baseUrl } = this.options;
    const command = `${baseUrl}?ucode=${userCode}&sid=${sid}&orgid=${orgid}`;
    const { data } = await this.sendRequest(command);
    const jsonData = await this.parseXmlString(data);
    return jsonData;
  }

  async findAuthor(id) {
    const userCode = this.userCode;
    const sid = this.sidTypes.GET_AUTHOR_METADATA;
    const { baseUrl } = this.options;
    const command = `${baseUrl}?ucode=${userCode}&sid=${sid}&authorid=${id}`;
    const { data } = await this.sendRequest(command);
    const jsonData = await this.parseXmlString(data);
    return jsonData;
  }

  async findAuthors(searchQuery) {
    const userCode = this.userCode;
    const sid = this.sidTypes.FIND_AUTHOR;
    const { baseUrl } = this.options;
    const requestQuery = this.encodeAuthorsQuery(searchQuery);
    const command = `${baseUrl}?ucode=${userCode}&sid=${sid}&${requestQuery}`;
    const { data } = await this.sendRequest(command);
    const jsonData = await this.parseXmlString(data);
    return jsonData;
  }

  encodeArticlesQuery(searchQuery) {
    return this.encodeQuery(searchQuery, this.options.allowedQuery.articles);
  }

  encodeAuthorsQuery(searchQuery) {
    return this.encodeQuery(searchQuery, this.options.allowedQuery.authors);
  }

  encodeQuery(searchQuery, allowedQuery) {
    const mapQueryScheme = this.mapQueryScheme();
    return encodeURI(
      Object.entries(searchQuery)
        .filter(([queryName]) => allowedQuery.includes(queryName))
        .map(([queryName, queryValue]) => [mapQueryScheme[queryName], queryValue])
        .map(queryRow => queryRow.join('='))
        .join('&'),
    );
  }

  mapQueryScheme() {
    return {
      authorid: 'authorid',
      titleid: 'titleid',
      orgid: 'orgid',
      year: 'yearpubl',
      spin: 'spin',
      name: 'au',
      lastName: 'aulast',
      firstName: 'aufirst',
      initials: 'auinit',
      country: 'co',
      countryCode: 'cc',
      city: 'city',
      orgName: 'inst',
    };
  }
}

module.exports = {
  Model: RISCModel,
  createModel: modelOptions => {
    return new RISCModel(modelOptions);
  },
};
