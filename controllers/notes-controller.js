const mongoose = require("mongoose");
const Moment = require("moment");
const { getStorage, ref, uploadBytes } = require("firebase/storage");
const fs = require("fs");

const HttpError = require("../models/http-error");
const Notes = require("../models/Note");
const Users = require("../models/Users");
const Attachment = require("../models/Attachment");
const { capitalize } = require("../Functions/helper-functions");
const { app } = require("../storage_intialize");

mongoose
  .connect(process.env.DATABASE_LINK, { useNewUrlParser: true })
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

const firebaseStorage = getStorage(app);

const addNotes = async (req, res, next) => {
  const createdNote = new Notes({
    note: req.body.note,
    title: "Untitled",
    createdBy: req.user.userId,
    sharedWith: [],
    createdOn: Moment().toArray(),
    lastUpdated: Moment().format("Do MMMM YYYY"),
  });
  try {
    await createdNote.save();
  } catch (err) {
    return next(new HttpError("Could not add node", 500));
  }
  res.status(200).json(createdNote);
};

const updateNotes = async (req, res, next) => {
  try {
    let note = {};
    note = await Notes.findById(req.body.noteId);
    if (!note) {
      return next(
        new HttpError(
          "Note not found in the database, please make sure it is valid note and not deleted."
        )
      );
    }
    note.lastUpdated = Moment().format("Do MMMM YYYY");
    let title = req.body.title || note.title;
    title = capitalize(title);
    note.note = req.body.note;
    note.title = title;
    await note.save();
    res.status(200).json({ message: "Updated" });
  } catch (err) {
    return next(
      new HttpError("Could not find note, make sure it is not deleted.", 500)
    );
  }
};

const updateTitle = async (req, res, next) => {
  try {
    // if (!req.body.title) {
    //   return next(
    //     new HttpError("Title not found, please make sure to include title")
    //   );
    // }
    let note = {};
    note = await Notes.findById(req.body.noteId);
    if (!note) {
      return next(
        new HttpError(
          "Note not found in the database, please make sure it is valid note and not deleted."
        )
      );
    }
    note.title = req.body.title || note.title;
    await note.save();
    res.status(200).json({ message: "Updated" });
  } catch (err) {
    return next(
      new HttpError("Could not find note, make sure it is not deleted.", 500)
    );
  }
};

const getRecentNotes = async (req, res, next) => {
  let notes = [];
  try {
    notes = await Notes.find(
      { createdBy: req.user.userId },
      "note _id title createdOn"
    );
    // console.log(notes);
    notes.forEach((element) => {
      const createTime = element.createdOn;
      let timeDiff = Moment(createTime.slice(0, 6)).fromNow();
      const noteData = element._doc;
      timeDiff = capitalize(timeDiff);
      noteData.created = timeDiff;
    });
    if (notes.length > 5) {
      notes = notes.slice(0, 5);
    }
    res.status(200).json({ notes });
  } catch (err) {
    return next(new HttpError("could not"), 404);
  }
};

const getAllNotes = async (req, res, next) => {
  let notes = [];
  try {
    // await getNoteById();
    notes = await Notes.find(
      { createdBy: req.user.userId },
      "note _id title createdOn lastUpdated lastOpened sharedWith"
    );
    notes.sort((a, b) => b.lastOpened.localeCompare(a.lastOpened));
    // console.log("second");
    notes.forEach((element) => {
      const createTime = element.createdOn;
      let timeDiff = Moment(createTime.slice(0, 6)).fromNow();
      const noteData = element._doc;
      timeDiff = capitalize(timeDiff);
      noteData.created = timeDiff;
    });
    const lengthOut =
      notes.length <= 1 ? `${notes.length} Note` : `${notes.length} Notes`;
    notes.sort;
    res.status(200).json({ notes, totalNotes: lengthOut });
  } catch (err) {
    console.log(err);
    return next(new HttpError("could not"), 404);
  }
};

const getNoteById = async (req, res, next) => {
  // console.log("hum first");
  try {
    const note = await Notes.findById(req.query.id);
    if (req.user.userId === note.createdBy || note.sharedWith.includes(req.user.userId)) {
      note.lastOpened = +new Date();
      await note.save();
      res.status(200).json({ note });
    } else{
      return next(
        new HttpError("You do not have the permission to access this note."),
        404
      );
    }
    // if (req.user.userId !== note.createdBy) {
    //   return next(
    //     new HttpError("You do not have the permission to access this note."),
    //     404
    //   );
    // }
    // note.lastOpened = + new Date();
    // await note.save();
    // res.status(200).json({ note });
  } catch (err) {}
};

const addTag = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.body.noteId);
    const newTag = {
      tagName: req.body.tagName,
      tagId: new mongoose.Types.ObjectId(),
    };
    note.tags.push(newTag);
    await note.save();
    res.status(200).json(newTag);
  } catch (err) {}
};

const getTags = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.query.id);
    const tags = note.tags;
    res.status(200).json(tags);
  } catch (err) {}
};

const removeTag = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.body.noteId);
    const tags = note.tags;
    const newTags = tags.filter((tag) => {
      return tag.tagId != req.body.tagId;
    });
    note.tags = newTags;
    await note.save();
    res.status(200).json("removed");
  } catch (err) {}
};

const uploadFile = async (req, res, next) => {
  try {
    const metadata = req.body.metadata;
    const createAttachment = new Attachment({
      metadata: metadata,
      name: metadata.name,
      link: metadata.link,
      type: metadata.contentType,
      noteId: req.body.noteId,
      uploadedBy: req.user.userId,
    });
    try {
      await createAttachment.save();
      // console.log(createAttachment);
    } catch (err) {
      console.log(err);
      return next(
        new HttpError(
          "Cannot attach file to the note, please try after some time"
        ),
        404
      );
    }
    res.status(200).json("Attachment has been added in the database.");
  } catch (err) {}
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.body.noteId);
    note.remove();
    res.status(200).json("Deleted");
  } catch (err) {}
};

const allFiles = async (req, res, next) => {
  const attachment = await Attachment.find({ noteId: req.query.noteId });
  const a = attachment.filter((val) => {
    return /^image/.test(val.type);
  });

  res.status(200).json({ a });
  // console.log(a.length);
  // setTimeout(() => res.status(200).json({a}), 100000);
};

const searchUser = async (req, res, next) => {
  if (req.query.email === req.user.email) {
    res
      .status(200)
      .json({
        message: "It is your own ID, you cannot share it with yourself.",
      });
  }

  const user = await Users.findOne({ email: req.query.email });
  if(!user){
    res.status(200).json({ message: "No user found" });
    return;
  }
  // console.log(user);
  res.status(200).json({ name: user.name, email: user.email, id: user._id });
};

const shareNote = async (req, res, next) => {
  const note = await Notes.findById(req.body.noteId);
  const sharedWith = note.sharedWith;
  // if(req.user.userId !== note.createdBy){
  //   console.log('yep')
  // }
  if(req.user.userId !== note.createdBy){
    res.status(200).json({ message: `Only Creator of the Note can share it with others. Please contact the creator of the Note.` });
    return;
  }
  if (sharedWith.includes(req.body.sharedWith)) {
    res.status(200).json({ message: "Already Given" });
    return;
  }
  sharedWith.push(req.body.sharedWith);
  note.sharedWith = sharedWith;
  await note.save();
  res.status(200).json({ message: "Access Provided" });
};

module.exports = {
  addNotes,
  updateNotes,
  getRecentNotes,
  getAllNotes,
  updateTitle,
  getNoteById,
  addTag,
  getTags,
  removeTag,
  uploadFile,
  deleteNote,
  allFiles,
  searchUser,
  shareNote,
};
