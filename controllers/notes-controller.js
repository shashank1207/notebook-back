const mongoose = require("mongoose");
const Moment = require("moment");

const HttpError = require("../models/http-error");
const Notes = require("../models/Note");
const { capitalize } = require("../Functions/helper-functions");

mongoose
  .connect(process.env.DATABASE_LINK, { useNewUrlParser: true })
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

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
      "note _id title createdOn lastUpdated lastOpened"
    );
    notes.sort((a,b) => b.lastOpened.localeCompare(a.lastOpened));
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
    notes.sort
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
    note.lastOpened = + new Date();
    await note.save();
    res.status(200).json({ note });
  } catch (err) {}
};

const addTag = async( req, res, next) => {
  try{
    const note = await Notes.findById(req.body.noteId);
    note.tags.push({tagName: req.body.tagName, tagId: new mongoose.Types.ObjectId});
    await note.save(); 
    res.status(200).json('added');
  } catch(err){}
};

const getTags = async(req, res, next) => {
  try{
    const note = await Notes.findById(req.query.id);
    const tags = note.tags;
    res.status(200).json(tags);
  } catch(err){}
};

const removeTag = async( req, res, next) => {
  try{
    console.log(req.body);
    const note = await Notes.findById(req.body.noteId);
    const tags = note.tags;
    const newTags = tags.filter(tag => {
      return tag.tagId != req.body.tagId;
    });
    note.tags = newTags;
    await note.save();
    res.status(200).json('removed');
  } catch(err){}
}
module.exports = {
  addNotes,
  updateNotes,
  getRecentNotes,
  getAllNotes,
  updateTitle,
  getNoteById,
  addTag,
  getTags,
  removeTag
};
