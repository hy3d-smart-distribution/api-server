var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var bundleRouter = require('./routes/bundle');
var tokenRouter = require('./routes/token');
var galleryRouter = require('./routes/gallery');
var companyRouter = requitr('./routes/company');
var env = 'development';
var config = require('./config')[env];
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('jwt-secret', config.secret);



app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
require('./hy3dAuth')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/bundle', bundleRouter);
app.use('/token', tokenRouter);
app.use('/gallery', galleryRouter);
app.use('/company', companyRouter);

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
