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
 *       tags:
 *       - Users
 *       summary: User authentication (login)
 *       requestBody:
 *         require: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 */
//authentication
router.post('/', async function(req, res) {
    let user = await User.findOne({ email: req.body.email }).exec()
    if (!user){
        res.status(400);
        res.json({ message:'User not found' });
        return;
    }
    let dbPassword = user.password;

    //console.log(dbPassword);
    //console.log(req.body.password);
    //console.log(await bcrypt.compare(req.body.password, dbPassword));

    if (!(await bcrypt.compare(req.body.password, dbPassword))){
        res.status(400);
        res.json({ message:'Wrong password' });
        return;
    }

    // user authenticated -> create a token
    let payload = { email: user.email, id: user._id}

    let options = { expiresIn: 3600 } // expires in 24 hours

    let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

    res.json({ id: user._id, token, email: user.email, role: roles.user //, self: "api/v1/users/" + user._id
    });
});

module.exports = router;