const mongoose = require('../db_connection');

const usersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

module.exports = mongoose.model('User', usersSchema);