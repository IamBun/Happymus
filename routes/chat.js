const express = require("express");

const router = express.Router();

const passport = require("passport");
// const isAuth = require("../middleware/is-Auth");
// const db = require("../util/database");

const chatController = require("../controllers/chatController");
//POST IMAGES
router.post(
  "/postImages",
  passport.authenticate("jwt", { session: false }),
  chatController.uploadImage
);

router.get(
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
