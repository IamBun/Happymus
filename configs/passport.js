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
        let user = {
          id: arr[0].id,
          email: arr[0].email,
          lastname: arr[0].last_name,
          firstname: arr[0].first_name,
        };
        // console.log("user", user);
        // Luu user nay vao req, goi next den middleware tiep theo
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
