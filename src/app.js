const express = require('express');
const path = require('path');
const logger = require('morgan');
const configureSwagger = require('./config/swaggerConfig');
const cors = require("cors");

const lockersRouter = require('./routes/lockers');
const usersRouter = require('./routes/users-registration');
const authenticationRouter = require('./routes/authentication');

const tokenChecker = require('./middlewares/tokenChecker');
const {log} = require("debug");

const app = express();

const originUrls = process.env.ORIGIN_ENV === 'production'
    ? ['https://easylocker.herokuapp.com']
    : ['http://localhost:3000', 'https://easylocker-staging.herokuapp.com'];

app.use(cors({
  origin: originUrls
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
configureSwagger(app);


// ------------------ Routes ------------------
app.use('/api/v1/authenticate', authenticationRouter);
app.use('/api/v1/users', usersRouter);

app.use(tokenChecker);
app.use('/api/v1/lockers', lockersRouter);


// catch 404 and forward to error handler)
app.use(function(req, res, next) {
  res.status(404);
  res.json({
    error: 'Not found'
  })
});


module.exports = app;
