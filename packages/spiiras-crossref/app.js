const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const crossref = require('./crossref');
const config = require('config');

const indexRouter = require('./routes/index');
const articleMetadataRouter = require('./routes/article-metadata');
const searchArticlesRouter = require('./routes/search-articles');

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  crossref({
    agentName: config.agentName,
    agentVersion: config.agentVersion,
    mailTo: config.mailTo,
    rows: config.rows,
  }),
);

app.use('/', indexRouter);
app.use('/article-metadata', articleMetadataRouter);
app.use('/search-articles', searchArticlesRouter);

module.exports = app;
