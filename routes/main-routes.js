const express = require("express");

const authControllers = require("../controllers/auth-controllers");

const router = express.Router();

router.post("/signup", authControllers.signupUser);

router.post("/login", authControllers.loginUser);

router.post("/verify", authControllers.verifyUser);

module.exports = router;
