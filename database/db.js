// db connection
const db = require("mongoose");

db.connect(process.env.DB_URL);

module.exports = db;