const express = require('express');
const User = require('../database/models/User');
const router = express.Router();
require('../database/db_connection')
const bcrypt = require ('bcrypt');
const saltRounds = 10;
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Create a user
router.post('/register', function (req, res, next) {
  console.log(req.body);

  //crypt password
  let password = req.body.password;

  //email controls
  var email = req.body.email;
  if( isEmailValid(email) ){

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
  }else{
    res.send('Invalid email');
  }
});

function isEmailValid(email) {
  if (!email)
    return false;

  if(email.length>254)
    return false;

  var valid = emailRegex.test(email);
  if(!valid)
    return false;

  // Further checking of some things regex can't handle
  var parts = email.split("@");
  if(parts[0].length>64)
    return false;

  var domainParts = parts[1].split(".");
  if(domainParts.some(function(part) { return part.length>63; }))
    return false;

  return true;
}

module.exports = router;