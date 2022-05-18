var express = require('express');
const User = require('../models/User');
var router = express.Router();

// db creation
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin@easylockertest.5tuqt.mongodb.net/?retryWrites=true&w=majority');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Create a user
router.post('/register', async function (req, res, next) {
  console.log(req.body);
  const user = new User(req.body);
  user.save();
  res.send();
})

module.exports = router;
