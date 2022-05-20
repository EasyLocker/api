const db = require('mongoose');

const usersSchema = new db.Schema({
    name: String,
    email: String,
    password: String
});

module.exports = db.model('User', usersSchema);