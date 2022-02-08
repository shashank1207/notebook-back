const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Users = require("../models/Users");

mongoose
  .connect(process.env.DATABASE_LINK, { useNewUrlParser: true })
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

const getScratch = async(req, res, next) => {
  try{
    const user = await Users.findById(req.user.userId);
    const scratch = user.scratch ? user.scratch : '';
    res.status(200).json(scratch);
  }
  catch(err){

  }
}

const updateScratch = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.userId);
    user.scratch = req.body.scratch;
    await user.save();
    res.status(200).json("Updated");
  } catch (err) {}
};

const errorCheck = async(req, res, next) => {
  res.status(500).json({message: 'Not connected to the internet, please check your connection. blah blah blah'});
}

module.exports = {
  updateScratch,
  getScratch,
  errorCheck
};
