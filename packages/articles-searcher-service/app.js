const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');

const { createService } = require('@articles-searcher/api-service');
const { createModel: createCrossrefModel } = require('@articles-searcher/crossref-model');
const { createModel: createScopusModel } = require('@articles-searcher/scopus-model');
const { createModel: createWOSModel } = require('@articles-searcher/wos-model');
const { createModel: createRISCModel } = require('@articles-searcher/risc-model');

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

const crossrefModel = createCrossrefModel({
  rows: config.crossref.rows,
  agent: {
    name: config.crossref.agentName,
    version: config.crossref.agentVersion,
    mailTo: config.crossref.mailTo,
  },
});
createService(app, crossrefModel, '/crossref');

const scopusModel = createScopusModel({
  rows: config.scopus.rows,
  apiKey: config.scopus.apiKey,
});
createService(app, scopusModel, '/scopus');

const wosModel = createWOSModel({
  rows: config.wos.rows,
  credentials: config.wos.credentials,
});
createService(app, wosModel, '/wos');

const riscModel = createRISCModel({
  userCode: config.risc.userCode,
});
createService(app, riscModel, '/risc');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
