const express = require("express");

const router = express.Router();

const passport = require("passport");
// const isAuth = require("../middleware/is-Auth");

router.use(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //  console.log("req user", req.user);
    const email = req.user.email;
    const id = req.user.id;
    res.json({ email, id });
  }
);

module.exports = router;
