import { validationResult } from "express-validator";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const getUserData = async (req: any, res: any, next: any) => {
  const userName = req.params.userName;

  let user;

  try {
    user = await User.findOne({ userName: userName }, "-password");
  } catch (err) {
    const error = new Error("Fetching user data failed !");
    return next(error);
  }

  if (!user) {
    const error = new Error("There is no profil with that name!");
    return next(error);
  }

  res.json({ userInfos: user.toObject({ getters: true }) });
};

const signup = async (req: any, res: any, next: any) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = Error("Wrong inputs, please check your data");
    return next(error);
  }

  const { userName, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email, userName: userName });
  } catch (err) {
    const error = new Error("Sign up failed");
    return next(error);
  }

  if (existingUser) {
    const error = new Error(
      "The data of the user already exist, please change your data"
    );
    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new Error("Could not create user, please try again.");
    return next(error);
  }

  const createdUser = new User({
    userName,
    email,
    password: hashedPassword,
    tweets: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new Error("Signing up failed, please try again.");
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, userName: createdUser.userName },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("Signing up failed, please try again later.");
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    userName: createdUser.userName,
    token: token,
  });
};

const login = async (req: any, res: any, next: any) => {
  const { email, password } = req.body;

  let identifiedUser;

  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new Error("Sign up failed");
    return next(error);
  }

  if (!identifiedUser) {
    const error = new Error("Invalid inputs passed, could not log you in");
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    const error = new Error(
      "Could not log you in, please check your credentials and try again."
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new Error(
      "Could not log you in, please check your credentials and try again."
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, userName: identifiedUser.userName },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Error("Logging in failed, please try again later.");
    return next(error);
  }

  res.json({
    userId: identifiedUser.id,
    userName: identifiedUser.userName,
    token: token,
  });
};

exports.signup = signup;
exports.login = login;
exports.getUserData = getUserData;
