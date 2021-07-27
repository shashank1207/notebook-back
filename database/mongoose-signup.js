const mongoose = require("mongoose");

const Users = require("../models/Users");

//this file is not being used anywhere, so please don't touch it.

mongoose
  .connect(
    "mongodb+srv://Shashank:Shashank@12@cluster0.b6msv.mongodb.net/notebook?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

const createUser = async (userdata) => {
  const { name, email, password } = userdata;

  const doesUserExist = await Users.findOne({'email': email});

  console.log(doesUserExist);

  if (doesUserExist) {
    return res.status(409).json({ message: "User already exists" });
  }

  const createdUser = new Users({
    name,
    email,
    password,
  });

  const result = await createdUser.save();
};

module.exports = { createUser };
