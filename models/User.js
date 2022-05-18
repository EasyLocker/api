import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

module.exports = mongoose.model('User', usersSchema);