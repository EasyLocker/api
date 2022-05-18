const express = require('express');
const User = require('../database/models/User');
const router = express.Router();
require('../database/db_connection')
const bcrypt = require ('bcrypt');
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Create a user
router.post('/register', function (req, res, next) {
  console.log(req.body);

  //crypt password
  let password = req.body.password;

  bcrypt.hash(password, saltRounds).then(function(hash) {

    //console.log(hash);
    const user = new User({name: req.body.name, email: req.body.email, password: hash});

    //storing in the db
    user.save((error) => {
      if (error) {
        console.log(error);
      } else {
        console.log('user registered');
        res.send();
      }
    });
  });

});

module.exports = router;