const sha1 = require("crypto-js/sha1");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Users = require("../models/Users");
const HttpError = require("../models/http-error");

const insertSaltInPassword = (string, salt, index) => {
  const preIn = string.slice(0, index);
  const postIn = string.slice(index, string.length);
  const finalPass = preIn + salt + postIn;

  return finalPass;
};

mongoose
  .connect(
    "mongodb+srv://Shashank:Shashank@12@cluster0.b6msv.mongodb.net/notebook?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

const signupUser = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new HttpError("Passwords are not matching", 406));
  }

  const emailStr = email.toString();

  const doesUserExist = await Users.findOne({ email: emailStr });

  if (doesUserExist) {
    return res.status(409).json({ message: "User already exists" });
  }

  const key = "a/nwbpdfg";

  const saltedPass = insertSaltInPassword(password, key, 2);
  let passwordEnc;

  try {
    passwordEnc = sha1(saltedPass).toString();
  } catch (err) {
    return next(
      new HttpError("Could not create an user, please try again.", 500)
    );
  }

  const createdUser = new Users({
    name,
    email: emailStr,
    password: passwordEnc,
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Could not signup, please try again.", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "shashank@12071998",
      { expiresIn: "5h" }
    );
  } catch (err) {
    return next(
      new HttpError("Could not create an user, please try again.", 500)
    );
  }

  res.status(201).json({
    message: "User successfully registered",
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });

  mongoose.disconnect();
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const emailStr = email.toString();

  const doesUserExist = await Users.findOne({ email: emailStr });

  if (!doesUserExist) {
    return res.status(409).json({ message: "User does not exists" });
  }

  let isValidPassword = false;
  const key = "a/nwbpdfg";

  const saltedPass = insertSaltInPassword(password, key, 2);
  let passwordEnc;
  try {
    passwordEnc = sha1(saltedPass).toString();
  } catch (err) {
    return next(new HttpError("Could not login, please try again.", 500));
  }
  isValidPassword = doesUserExist.password === passwordEnc;
  if (!isValidPassword) {
    return next(
      new HttpError(
        "Invalid credentials, please check your credentials and try again.",
        401
      )
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: doesUserExist.id, email: doesUserExist.email },
      "shashank@12071998",
      { expiresIn: "5h" }
    );
  } catch (err) {
    return next(new HttpError("Could not login, please try again.", 500));
  }

  res.json({
    userId: doesUserExist.id,
    email: doesUserExist.email,
    token: token,
    message: "User successfully logged in.",
  });
};

const verifyUser = (req, res, next) => {
  const decoded = jwt.verify(req.body.token, "shashank@12071998");
  req.user = decoded;
  if (req.body.userId && req.body.userId === decoded.userId) {
    res.status(200).json({ message: "You are authenticated." });
  }
  else{
    return next(new HttpError(`your token: ${req.body.userId}`))
  }
};

module.exports = { signupUser, loginUser, verifyUser };
