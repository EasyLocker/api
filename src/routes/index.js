const express = require('express');
const authenticationRouter = require("./authentication");
const usersRouter = require("./users-registration");
const tokenChecker = require("../middlewares/tokenChecker");
const lockersRouter = require("./lockers");
const router = express.Router();

router.get('/*', function(req, res, next){
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next();
});

router.use('/v1/authenticate', authenticationRouter);
router.use('/v1/users', usersRouter);

router.use('/v1/lockers', tokenChecker, lockersRouter);


module.exports = router;
