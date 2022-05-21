const express = require('express');
const router = express.Router();
const User = require('../db_models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//authentication
router.post('/', async function(req, res) {
    let user = await User.findOne({ email: req.body.email }).exec()
    if (!user) res.json({success:false,message:'User not found'})
    let dbPassword = user.password;

    //console.log(dbPassword);
    //console.log(req.body.password);

    console.log(await bcrypt.compare(req.body.password, dbPassword));
    if (!(await bcrypt.compare(req.body.password, dbPassword))){
        res.json({success:false,message:'Wrong password'}); //check error in here
        //res.status(400);
    }

    // user authenticated -> create a token
    let payload = { email: user.email, id: user._id}

    let options = { expiresIn: 86400 } // expires in 24 hours

    let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

    res.json({ success: true, message: 'Enjoy your token!',
        token: token, email: user.email, id: user._id, self: "api/v1/" + user._id
    });
});

module.exports = router;