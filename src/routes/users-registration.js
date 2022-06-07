const express = require('express');
const User = require('../db_models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const {isEmailValid} = require("../utils/strings_utils");
const saltRounds = 10;
const roles = require('../config/roles');
const jwt = require("jsonwebtoken");

/**
 * @openapi
 * /api/v1/users/register:
 *   post:
 *     responses:
 *      '200':
 *         description: User correctly authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Id of the user in the database
 *                   example: 6290daa478b876fa28581b97
 *                 token:
 *                   type: string
 *                   description: Token which grants the access to the resources
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *                 email:
 *                   type: email
 *                   description: Email of the user just registered
 *                   example: Mariorossi@example.it
 *                 role:
 *                   type: string
 *                   description: Role of the user just registered, it will tipically be 'User'
 *                   example: User
 *                 name:
 *                   type: string
 *                   description: Name of the user just registered
 *                   example: Mario
 *                 surname:
 *                   type: string
 *                   description: Surname of the user just registered
 *                   example: Rossi
 *      '400':
 *         $ref: '#/components/responses/code400'
 *      '500':
 *         $ref: '#/components/responses/code500'
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
 *                 example: Mario
 *               surname:
 *                 type: string
 *                 example: Rossi
 *               email:
 *                 type: string
 *                 example: Mariorossi@example.it
 *               password:
 *                 type: string
 *                 example: Password
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
            id: user._id,
            token,
            email: user.email,
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
