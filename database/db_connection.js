// db connection
const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://admin:admin@easylockertest.5tuqt.mongodb.net/?retryWrites=true&w=majority');

module.exports = mongoose;