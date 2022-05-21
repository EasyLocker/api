const express = require('express');
const User = require('../db_models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const {log} = require("debug");
const {isEmailValid} = require("../utils/strings_utils");
const saltRounds = 10;

/**
 * @openapi
 * /api/v1/users/register:
 *   post:
 *     tags:
 *     - Users
 *     description: User registration (creation of a user in the mongodb)
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *
 */
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
