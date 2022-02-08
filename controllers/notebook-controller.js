const mongoose = require("mongoose");
const Moment = require("moment");
const { createNotebook } = require("../utils/create-notebook");

const createNewNotebook = (req, res, next) => {
  createNotebook(req.body.id);
}

module.exports = {createNewNotebook}