const path = require('path');
const express = require('express');

// global config
const config = require('./config');

// express app init.
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
let app = express();
app.set('views', path.join(__dirname, '..', 'views', config.theme));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, '../static')));
app.use(express.static(path.join(__dirname, '../static'), { maxAge: config.static.max_age }));
app.use(lessMiddleware(path.join(__dirname, '../views', config.theme, 'static')));
app.use(express.static(path.join(__dirname, '../views', config.theme, 'static'), { maxAge: config.static.max_age }));

// router
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404
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