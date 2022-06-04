const express = require('express');
const User = require('../db_models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const {log} = require("debug");
const {isEmailValid} = require("../utils/strings_utils");
const saltRounds = 10;
const roles = require('../config/roles');
const jwt = require("jsonwebtoken");

/**
 * @openapi
 * /api/v1/users/register:
 *   post:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Users
 *     summary: Register a new user
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *
 */
//Create a user
router.post('/register', async (req, res, next) => {
    const {name, surname, email, password} = req.body;
    if (!name){
        res.status(400);
        res.json({message: 'Missing name'});
        return;
    }

    if (!surname){
        res.status(400);
        res.json({message: 'Missing surname'});
        return;
    }

    if (!email){
        res.status(400);
        res.json({message: 'Missing email'});
        return;
    }

    if (!password){
        res.status(400);
        res.json({message: 'Missing password'});
        return;
    }

    try {
        if (!isEmailValid(email)) {
            res.status(400);
            res.json({message: 'Invalid email'});
            return;
        }

        if (await User.exists({'email': email})) {
            res.status(400);
            res.json({message: 'Email already used'});
            return;
        }

        //password hashing + salt
        const hash = await bcrypt.hash(password, saltRounds);
        const user = new User({name, surname, email, password: hash, role: roles.user});

        //storing in the db
        await user.save();

        //login token creation
        let payload = { email: user.email, id: user._id}
        let options = { expiresIn: 3600 } // expires in 24 hours
        let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        res.json({
            token,
            email: user.email,
            id: user._id,
            role: roles.user,
            name: user.name,
            surname: user.surname
            //, self: "api/v1/users/" + user._id
        });

    } catch (err) {
        next(err)
        // console.log(err);
        // res.status(500);
        // res.json({message: 'Cannot create user'});
    }
});

//router.get('/:userId' ..

module.exports = router;
