const express = require('express');
const router = express.Router();
const User = require('../db_models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const roles = require('../config/roles');

/**
 * @openapi
 * paths:
 *   /api/v1/authenticate:
 *     post:
 *      responses:
 *       '200':
 *         description: 'OK'
 *      tags:
 *       - Users
 *      summary: Authenticate user
 *      requestBody:
 *        require: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 */
//authentication
router.post('/', async function(req, res) {
    let user = await User.findOne({ email: req.body.email }).exec()
    if (!user){
        res.status(400);
        res.json({ message:'Email or password not correct' });
        return;
    }
    let dbPassword = user.password;

    //console.log(dbPassword);
    //console.log(req.body.password);
    //console.log(await bcrypt.compare(req.body.password, dbPassword));

    if (!(await bcrypt.compare(req.body.password, dbPassword))){
        res.status(400);
        res.json({ message:'Email or password not correct' });
        return;
    }

    // user authenticated -> create a token
    let payload = { email: user.email, id: user._id, role: user.role};

    let options = { expiresIn: 3600 }; // expires in 24 hours

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
});

module.exports = router;