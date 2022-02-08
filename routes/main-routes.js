const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require('dotenv').config();

const authControllers = require("../controllers/auth-controllers");
const notesControllers = require("../controllers/notes-controller");
const scratchContollers = require("../controllers/scratch-controller")
const HttpError = require("../models/http-error");

const router = express.Router();

router.use(cors());

router.post("/signup", authControllers.signupUser);

router.post("/login", authControllers.loginUser);

router.use(authControllers.verifyUser);

router.get("/get-user", authControllers.getUser);

router.post("/add", notesControllers.addNotes);

router.post("/update", notesControllers.updateNotes);

router.post("/update-title", notesControllers.updateTitle);

router.get("/get-recent-notes", notesControllers.getRecentNotes);

router.get("/get-all-notes", notesControllers.getAllNotes);

router.get("/get-note", notesControllers.getNoteById);

router.post("/add-tag", notesControllers.addTag);

router.get("/get-tags", notesControllers.getTags);

router.post("/delete-tag", notesControllers.removeTag);

router.post("/update-scratch", scratchContollers.updateScratch);

router.get("/get-scratch", scratchContollers.getScratch);

router.post("/error", scratchContollers.errorCheck);

router.post("/upload-file", notesControllers.uploadFile);

router.post("/delete-note", notesControllers.deleteNote);

router.get("/get-all-files", notesControllers.allFiles);

router.get("/search-user", notesControllers.searchUser);

router.post("/share-note", notesControllers.shareNote);

module.exports = router;
