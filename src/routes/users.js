const express = require('express');
const User = require('../db_models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const {log} = require("debug");
const {isEmailValid} = require("../utils/strings_utils");
const saltRounds = 10;

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//Create a user
router.post('/register', async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!isEmailValid(email)) {
        res.status(400);
        res.send('Invalid email');
    }

    if (User.exists({ 'email': email })) {
        res.status(400);
        res.send('Email already used');
    }

    try {
        //password hashing + salt
        const hash = await bcrypt.hash(password, saltRounds);
        const user = new User({name, email, password: hash});

        //storing in the db
        await user.save();
        res.send();
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send('Cannot create user');
    }
});

module.exports = router;
