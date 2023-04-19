const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const jwtStrategy = passportJWT.Strategy;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // Bearer + token
jwtOptions.secretOrKey = "secret"; //secret key

const db = require("../util/database");

//passport login jwt
const loginStrategy = new jwtStrategy(jwtOptions, function (jwt_payload, cb) {
  //   console.log("jwt_payload : ", jwt_payload);
  if (!jwt_payload) {
    throw new Error("Token is not valid");
  }
  const email = jwt_payload.email;
  //   console.log("email", email);
  db.query("SELECT * FROM users WHERE email = ?", [email])
    .then((result) => {
      return result[0];
    })
    .then((arr) => {
      if (arr) {
        //   console.log("user", user);
        let user = { ...arr[0] };
        cb(null, user);
      } else {
        cb(null, false);
      }
    });
});

passport.use(loginStrategy);

//xac thuc thanh cong, luu user vao session
// passport.serializeUser(function (user, done) {
//   console.log("user", user);
//   done(null, user.email);
// });

//lay du lieu tu session luu vao req.session
// passport.deserializeUser(function (userInfo, done) {
//   const email = userInfo[0].email;
//   const id = userInfo[0].id;
//   done(err, { email, id });
// });
