const requireRole = (role) => {
    return (req, res, next) => {
        if (req.loggedUser.role !== role) {
            res.status(403);
            res.json({message: 'Non hai i permessi per effettuare questa azione!'});
            return;
        }
        next();
    };
}

module.exports = requireRole;
