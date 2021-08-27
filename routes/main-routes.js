const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const authControllers = require("../controllers/auth-controllers");
const notesControllers = require("../controllers/notes-controller");
const HttpError = require("../models/http-error");

const router = express.Router();

router.use(cors());

router.post("/signup", authControllers.signupUser);

router.post("/login", authControllers.loginUser);

router.use(authControllers.verifyUser);

router.get("/get-user", authControllers.getUser);

router.post("/add", notesControllers.addNotes);

router.post("/update", notesControllers.updateNotes);

router.get("/get-notes", notesControllers.getAllNotes);

module.exports = router;
