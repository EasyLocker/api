require('dotenv').config();
const app = require('./src/app');
const db = require("mongoose");

const dbUrl = process.env.DB_URL || 'localhost:27017';
const port = process.env.PORT || 8080;

db.connect(dbUrl, () => {
  console.log("Connected to Database");

  app.listen(port, () => {
    console.log('Server running on port ', process.env.PORT);
  });
});
