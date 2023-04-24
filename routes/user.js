const express = require("express");
const passport = require("passport");

const router = express.Router();

const userController = require("../controllers/userController");

//find friends by query name
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  userController.findFriends
);

//find all user you can send requests
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  userController.getAllUsers
);

module.exports = router;

//request add friends
router.post(
  "/addfriend",
  passport.authenticate("jwt", { session: false }),
  userController.addFriend
);

//accepted friend
router.post(
  "/acceptfriend",
  passport.authenticate("jwt", { session: false }),
  userController.acceptedFriend
);

//get all request
router.get(
  "/requests",
  passport.authenticate("jwt", { session: false }),
  userController.getFriendRequest
);

//get all friends in friend list
router.get(
  "/friends",
  passport.authenticate("jwt", { session: false }),
  userController.getFriends
);
