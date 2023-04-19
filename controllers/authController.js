const bcrypt = require("bcrypt");
const db = require("../util/database");
const jwt = require("jsonwebtoken");

exports.postReg = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT email FROM users");
    const emails = result[0];
    emails.forEach((element) => {
      if (element.email === email) {
        res.json("Email is already exist !");
        throw new Error("Email exist !");
      }
    });
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashedPassword,
    ]);
    res.json("Sign up success !");
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

  console.log(req.body);

  try {
    const result = await db.query("SELECT email FROM users");
    const emails = result[0];
    for (ele of emails) {
      if (ele.email === email) {
        // CHECK PASS
        const userPass = await db.query(
          "SELECT password FROM users WHERE email = ?",
          [email]
        );
        // console.log(userPass[0][0]);
        const passwordhashed = userPass[0][0].password;
        const comparePass = await bcrypt.compare(password, passwordhashed);

        if (comparePass) {
          const token = jwt.sign({ email }, "secret");
          return res.json(token);
        } else {
          res.json("Password is wrong !");
          throw new Error("Password is wrong !");
        }
      }
    }
    res.json("Email is wrong !");
    throw new Error("Email is wrong !");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
