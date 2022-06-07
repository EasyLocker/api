const jwt = require('jsonwebtoken');

//check if there is a valid token
const tokenChecker = function (req, res, next) {
    // console.log('verify token')
    // Retrieve token from header
    const token = req.headers['authorization']?.replace('Bearer ', '');
    // console.log("Token in checker " + token)
    if (!token){
        res.status(401).send();
        return;
    }

    // decode token, verifies secret and checks expiration
    jwt.verify(token, process.env.SUPER_SECRET, function (err, decoded) {
        if (err){
            res.status(401).send();
            console.log(err);
        } else {

            // if everything is good, save in req object for use in other routes
            req.loggedUser = decoded;
            next();
        }
    });
};

module.exports = tokenChecker;
