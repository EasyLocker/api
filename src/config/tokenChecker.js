const jwt = require('jsonwebtoken');

//check if there is a valid token
const tokenChecker = function (req, res, next) {
    // Retrieve token from header
    const token = req.headers['authorization']?.replace('Bearer ', '')

    if (!token) res.status(401).json({success: false, message: 'No token provided.'})

    // decode token, verifies secret and checks expiration
    jwt.verify(token, process.env.SUPER_SECRET, function (err, decoded) {
        if (err){
            res.status(403).json({success: false, message: 'Token not valid'});
            console.log(err);
        } else {

            // if everything is good, save in req object for use in other routes
            req.loggedUser = decoded;
            //console.log(decoded);
            next();
        }
    });
};

module.exports = tokenChecker;