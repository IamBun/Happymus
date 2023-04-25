const express = require("express");
const router = express.Router();
const passport = require("passport");

const postController = require("../controllers/postController");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  postController.createPost
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  postController.getPosts
);

module.exports = router;
