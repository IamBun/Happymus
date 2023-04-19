const express = require("express");
const passport = require("passport");

const router = express.Router();

const authController = require("../controllers/authController");

//LOGIN
router.post("/login", authController.postLogin);

//REGISTER
router.post("/register", authController.postReg);

module.exports = router;
