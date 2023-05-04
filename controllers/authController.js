const bcrypt = require("bcrypt");
const db = require("../util/database");
const jwt = require("jsonwebtoken");

exports.postReg = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  try {
    const result = await db.query("SELECT email FROM users");
    const emails = result[0];
    emails.forEach((element) => {
      if (element.email === email) {
        const error = new Error("Email is already exists");
        error.statusCode = 400;
        throw error;
      }
    });
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.query(
      "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?,?,?)",
      [email, hashedPassword, firstName, lastName]
    );
    res.status(201).json({ message: "Sign up success !" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // console.log(req.body.email);

  try {
    const result = await db.query(
      "SELECT email FROM users WHERE email = ?",
      email
    );
    const emails = result[0];
    if (emails.length == 0) {
      const error = new Error("Email is wrong !");
      error.statusCode = 400;
      throw error;
    }

    const userPass = await db.query(
      "SELECT email,password,last_name,first_name, id FROM users WHERE email = ?",
      [email]
    );
    // console.log(userPass[0][0].password);
    const passwordhashed = userPass[0][0].password;
    const comparePass = await bcrypt.compare(password, passwordhashed);

    if (comparePass) {
      const token = jwt.sign({ email, id: userPass[0][0].id }, "secret");
      // console.log(userPass[0][0]);

      return res.json({
        userId: userPass[0][0].id,
        email: userPass[0][0].email,
        last_name: userPass[0][0].last_name,
        first_name: userPass[0][0].first_name,
        token: token,
      });
    } else {
      const error = new Error("Password is wrong !");
      error.statusCode = 400;
      throw error;
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
