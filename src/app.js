const express = require('express');
const path = require('path');
const logger = require('morgan');
const configureSwagger = require('./config/swaggerConfig');
const cors = require("cors");

const routes = require('./routes/index');

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

app.use('/api', routes);

app.use(express.static(path.join(__dirname, '..', 'public')));
configureSwagger(app);

// catch 404 and forward to error handler)
app.use(function(req, res, next) {
  res.status(404);
  res.json({
    error: 'Not found'
  })
});


module.exports = app;
