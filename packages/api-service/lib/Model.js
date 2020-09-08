'use strict';

class Model {
  constructor() {
    this.routes = [];

    this.setRoute('/article/*', async ({ params }) => {
      const doi = params[0];
      const article = await this.findArticle(doi);
      return article;
    });

    this.setRoute('/articles', async ({ query }) => {
      const acticles = await this.findArticles(query);
      return acticles;
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

  setRoute(path, action) {
    this.routes.push({ path, action });
  }
}

module.exports = Model;
