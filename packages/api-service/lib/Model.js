'use strict';

const axios = require('axios');
const { DataServiceError } = require('./DataServiceError');

class Model {
  constructor() {
    this.routes = [];

    this.setRoute('/article/*', async ({ params }) => {
      try {
        const doi = params[0];
        const article = await this.findArticle(doi);
        return article;
      } catch (error) {
        if (error instanceof DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });

    this.setRoute('/articles', async ({ query }) => {
      try {
        const acticles = await this.findArticles(query);
        return acticles;
      } catch (error) {
        if (error instanceof DataServiceError) {
          return `${error.status}: ${error.message}`;
        }
        throw error;
      }
    });
  }

  getStatus() {
    return JSON.stringify({
      service: this.name,
      ...this.options,
    });
  }

  async findArticle(id) {
    throw new TypeError(
      `TypeError (api-service): ${this.name} service no implementation for findArticle method`,
    );
  }

  async findArticles(searchQuery) {
    throw new TypeError(
      `TypeError (api-service): ${this.name} service no implementation for findArticles method`,
    );
  }

  sendRequest(command, options) {
    const {
      DATA_API_NOT_FOUND_DATA,
      DATA_API_REJECT_REQUEST,
      DATA_API_UNAVAILABLE,
      DATA_API_BAD_REQUEST,
    } = DataServiceError.statusCodes;

    return axios
      .request({ url: command, ...options })
      .then(response => response)
      .catch(error => {
        if (error.response.status === 400) {
          throw new DataServiceError({
            message: 'Запрос данных выполнен с неправильными параметрами',
            status: DATA_API_BAD_REQUEST,
          });
        }
        if (error.response.status === 404) {
          throw new DataServiceError({
            message: 'Сервис данных не обнаружил искомых данных',
            status: DATA_API_NOT_FOUND_DATA,
          });
        }
        if (error.response) {
          throw new DataServiceError({
            message: 'Сервис данных не может обработать запрос',
            status: DATA_API_REJECT_REQUEST,
          });
        }
        if (error.request) {
          throw new DataServiceError({
            message: 'Сервис данных не отвечает на запрос',
            status: DATA_API_UNAVAILABLE,
          });
        }
        throw error;
      });
  }

  setRoute(path, action) {
    this.routes.push({ path, action });
  }
}

Model.DataServiceError = DataServiceError;

module.exports = Model;
