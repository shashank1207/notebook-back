const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const noteSchema = new Schema({
  note: { type: String, required: false },
  title: { type: String, required: true },
  createdBy: { type: String, required: true },
  sharedWith: [[]],
  createdOn: []
});

module.exports = model("Notes", noteSchema);
