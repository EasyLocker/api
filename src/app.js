const express = require('express');
const path = require('path');
const logger = require('morgan');
const configureSwagger = require('./config/swaggerConfig');
const cors = require("cors");

const lockersRouter = require('./routes/lockers');
const usersRouter = require('./routes/users');
const authenticationRouter = require('./routes/authentication');

const tokenChecker = require('./config/tokenChecker');
const {log} = require("debug");

const app = express();

app.use(cors({
  origin: ['http://localhost:3000']
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
configureSwagger(app);

// ------------------ Routes ------------------

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/authenticate', authenticationRouter); //lo mettiamo sotto /api/v1/users/u?
app.use('/api/v1/lockers', lockersRouter);

// any path after token checker will require a valid token
//app.use(tokenChecker);

/*
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  res.json({
    error: 'Not found'
  })
});


module.exports = app;
