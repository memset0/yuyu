const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const express = require('express');

// register global arguments
global.source_dir = process.env['YUYU_SOURCE'] || path.join(__dirname, '../src/');
global.status = 'online';
global.router = require('./router')
global.config = YAML.parse(fs.readFileSync(path.join(source_dir, 'config.yml')).toString());

// express app init.
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
let app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, '../static')));
app.use(express.static(path.join(__dirname, '../static'), { maxAge: config.static.max_age }));

// router
app.use(require('./routes/middleware/page'))
app.use('/', require('./routes/index'));
app.use('/edit', require('./routes/editor'));

// catch 404 error
const createError = require('http-errors');
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
