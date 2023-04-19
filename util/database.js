const mysql = require("mysql2");

const connection = mysql.createConnection({
  port: 3307,
  host: "localhost",
  user: "root",
  database: "happymus_test1",
});

module.exports = connection.promise();
