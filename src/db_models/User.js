const db = require('mongoose');

const usersSchema = new db.Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    role: String
});

module.exports = db.model('User', usersSchema);
