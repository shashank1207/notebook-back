const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const fileSchema = new Schema({
  metadata: {type: Object, required: true},
  name: {type: String, required: true},
  link: {type: String, required: true},
  type: {type: String, required: false},
  noteId: {type: String, required: true},
  uploadedBy: {type: String, required: true}
});

module.exports = model("Attachment", fileSchema);