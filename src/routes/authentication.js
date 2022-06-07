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
 *         description: User correctly authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Id dello user
 *                   example: 6290daa478b876fa28581b97
 *                 token:
 *                   type: string
 *                   description: Token per garantire l'accesso alle risorse
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *                 email:
 *                   type: email
 *                   description: Email dell'utente appena registrato
 *                   example: Mariorossi@example.it
 *                 role:
 *                   type: string
 *                   description: Ruolo dell'utente, può essere 'Admin' o 'User'
 *                   example: User
 *                 name:
 *                   type: string
 *                   description: Nome dell'utente appena registrato
 *                   example: Mario
 *                 surname:
 *                   type: string
 *                   description: Cognome dell'utente appena registrato
 *                   example: Rossi
 *       '400':
 *         $ref: '#/components/responses/code400'
 *       '500':
 *         $ref: '#/components/responses/code500'
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
 *                  example: email@example.com
 *                password:
 *                  type: string
 *                  example: password
 */
//authentication
router.post('/', async function(req, res) {
    const reqEmail = req.body.email;
    if (!reqEmail){
        res.status(400);
        res.json({ message:'Missing email' });
        return;
    }

    let user = await User.findOne({ email: reqEmail }).exec();
    if (!user){
        res.status(400);
        res.json({ message:'Email or password not correct' });
        return;
    }
    let dbPassword = user.password;

    if (!(await bcrypt.compare(req.body.password, dbPassword))){
        res.status(400);
        res.json({ message:'Email or password not correct' });
        return;
    }

    // user authenticated -> create a token
    let payload = { email: user.email, id: user._id, role: user.role};

    let options = { expiresIn: 3600 }; // expires in 1 hour

    let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

    res.json({
        id: user._id,
        token,
        email: user.email,
        role: user.role,
        name: user.name,
        surname: user.surname
        //, self: "api/v1/users/" + user._id
    });
    
});

module.exports = router;
