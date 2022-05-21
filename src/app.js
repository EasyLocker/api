const express = require('express');
const path = require('path');
const logger = require('morgan');
const configureSwagger = require('./config/swaggerConfig');

const usersRouter = require('./routes/users');
const authenticationRouter = require('./routes/authentication');

const tokenChecker = require('./config/tokenChecker');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
configureSwagger(app);

// ------------------ Routes ------------------

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/authenticate', authenticationRouter); //lo mettiamo sotto /api/v1/users/authenticate?

// any path after token checker will require a valid token
//app.use(tokenChecker);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  res.json({
    error: 'Not found'
  })
});


module.exports = app;
