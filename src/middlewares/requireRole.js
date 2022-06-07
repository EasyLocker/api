const requireRole = (role) => {
    return (req, res, next) => {
        if (req.loggedUser.role !== role) {
            res.status(403);
            res.json({message: 'Your role does not permit this action!'});
            return;
        }
        next();
    };
}

module.exports = requireRole;
