const express = require("express");
const router = express.Router();
const passport = require("passport");

const postController = require("../controllers/postController");

//GET USER POST
router.get(
  "/user/:id",
  passport.authenticate("jwt", { session: false }),
  postController.getUserPost
);

//GET POST BY YOURSELF
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  postController.getPosts
);

//UPLOAD POST
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  postController.createPost
);

module.exports = router;
