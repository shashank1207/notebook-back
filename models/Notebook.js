const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const fileSchema = new Schema({
  name: {type: String, required: true},
  createdBy: {type: String, required: true},
  createdOn: {type: String, required: true},
  notesAssigned: []
});

module.exports = model("Notebook", fileSchema);