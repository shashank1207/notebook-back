const mongoose = require("mongoose");
const Moment = require('moment');

const HttpError = require("../models/http-error");
const Notes = require("../models/Note");
const { capitalize } = require("../Functions/helper-functions");

mongoose
  .connect(
    "mongodb+srv://Shashank:Shashank@12@cluster0.b6msv.mongodb.net/notebook?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

const addNotes = async (req, res, next) => {
  const createdNote = new Notes({
    note: "",
    title: "Untitled",
    createdBy: req.user.userId,
    sharedWith: [],
    createdOn: Moment().toArray(),
  });
  try {
    await createdNote.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not add node", 500));
  }
  res.status(200).json(createdNote);
};

const updateNotes = async (req, res, next) => {
  let note = {};
  try {
    note = await Notes.findById(req.body.noteId);
    if (!note) {
      return next(
        new HttpError(
          "Note not found in the database, please make sure it is valid note and not deleted."
        )
      );
    }
  } catch (err) {
    return next(
      new HttpError("Could not find note, make sure it is not deleted.", 500)
    );
  }
  let title = req.body.title || note.title;
  title = capitalize(title);
  note.note = req.body.note;
  note.title = title;
  await note.save();
  res.status(200).json({ message: "Updated" });
};

const getAllNotes = async (req, res, next) => {
  let notes = [];
  try {
    notes = await Notes.find(
      { createdBy: req.user.userId },
      "note _id title createdOn"
    );
    // console.log(notes);
    notes.forEach((element) => {
      const createTime = element.createdOn;
      let timeDiff = Moment(createTime.slice(0,6)).fromNow();
      const noteData = element._doc;
      timeDiff = capitalize(timeDiff);
      noteData.created = timeDiff;
    });
    if(notes.length > 5){
      notes = notes.slice(0,5);
    }
    res.status(200).json({ notes });
  } catch (err) {
    return next(new HttpError("could not"), 404);
  }
};

module.exports = { addNotes, updateNotes, getAllNotes };
