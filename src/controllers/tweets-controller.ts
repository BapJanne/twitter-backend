import { validationResult } from "express-validator";
import mongoose, { startSession } from "mongoose";

const Tweet = require("../models/tweet");
const User = require("../models/user");

const addTweet = async (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("The inputs are unvalid, please check your data!");
    return next(error);
  }

  const { tweetContent, authorName, authorId } = req.body;

  const createdTweet = new Tweet({
    tweetContent,
    authorName,
    authorId,
    rts: [],
    likes: [],
  });

  let user;

  try {
    user = await User.findById(authorId);
  } catch (err) {
    const error = new Error("Creating a tweet failed!");
    return next(error);
  }

  if (!user) {
    const error = new Error("Could not find a user for the provided username");
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTweet.save({ session: sess });
    user.tweets.push(createdTweet);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error("Creating a tweet failed");
    return next(error);
  }

  res.status(201).json({ tweet: createdTweet });
};

const getAllTweets = async (req: any, res: any, next: any) => {
  let tweets;

  try {
    tweets = await Tweet.find({});
  } catch (err) {
    const error = new Error("Error during the fetch of all tweets");
    return next(error);
  }

  if (!tweets || tweets.length === 0) {
    const error = new Error("There is no tweets");
    return next(error);
  }

  res.status(201).json({
    tweets: tweets.map((tweet: any) => tweet.toObject({ getters: true })),
  });
};

const getTweetsById = async (req: any, res: any, next: any) => {
  const tweetId = req.params.tid;

  let tweet;

  try {
    tweet = await Tweet.findById(tweetId);
  } catch (err) {
    const error = new Error("Error during the fetch tweets");
    return next(error);
  }

  if (!tweet) {
    const error = new Error("There is no tweet");
    return next(error);
  }

  res.json({ tweet: tweet.toObject({ getters: true }) });
};

const getTweetsByUserName = async (req: any, res: any, next: any) => {
  const userName = req.params.uid;

  let tweets;

  try {
    tweets = await Tweet.find({ authorName: userName });
  } catch (err) {
    const error = new Error("Failed to fetch data to userName");
    return next(error);
  }

  if (!tweets || tweets.length === 0) {
    const error = new Error("Could not find tweet for the provided username");
    return next(error);
  }

  res.status(201).json({
    tweets: tweets.map((tweet: any) => tweet.toObject({ getters: true })),
  });
};

const updateTweet = async (req: any, res: any, next: any) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new Error("The tweet must contain beetween 1 and 255 characters");
  }

  const { tweetContent } = req.body;
  const tweetId = req.params.tid;

  let tweet;

  try {
    tweet = await Tweet.findById(tweetId);
  } catch (err) {
    const error = new Error("Could not find the tweet with that id");
    return next(error);
  }
  tweet.tweetContent = tweetContent;

  try {
    await tweet.save();
  } catch (err) {
    const error = new Error("Cound not save the updated tweet");
    return next(error);
  }

  res.status(200).json({ tweet: tweet });
};

const deleteTweet = async (req: any, res: any, next: any) => {
  const tweetId = req.params.tid;

  let tweet;

  try {
    tweet = await Tweet.findById(tweetId).populate("authorId");
  } catch (err) {
    const error = new Error("Something went wrong when finding id of tweet");
    return next(error);
  }

  console.log(tweet);

  if (!tweet) {
    const error = new Error("Could not find a tweet with the provided id");
    return next(error);
  }

  if (tweet.authorId.id.toString() !== req.userData.userId) {
    const error = new Error("You are not allowed to delete a tweet");
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await tweet.deleteOne({ session: sess });
    tweet.authorId.tweets.pull(tweet);

    await tweet.authorId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error("Cound not delete the tweet");
    return next(error);
  }

  res.status(200).json({ message: "Tweet deleted" });
};

const likeTweet = async (req: any, res: any, next: any) => {
  const tweetId = req.params.tid;
  const { userId } = req.body;

  let tweet;

  try {
    tweet = await Tweet.findById(tweetId);
  } catch (err) {
    const error = new Error("Could not find the likes");
    return next(error);
  }

  if (!tweet) {
    const error = new Error("Could not find the tweet with that id");
    return next(error);
  }

  try {
    if (tweet.likes.includes(userId)) {
      tweet.likes.pull(userId);
      await tweet.save();
    } else {
      tweet.likes.push(userId);
      await tweet.save();
    }
  } catch (err) {
    const error = new Error("OOps it failed");
    return next(error);
  }

  res.json({ tweet: tweet });
};

const rtTweet = async (req: any, res: any, next: any) => {
  const tweetId = req.params.tid;
  const { userId } = req.body;

  let tweet;

  try {
    tweet = await Tweet.findById(tweetId);
  } catch (err) {
    const error = new Error("Could not find the likes");
    return next(error);
  }

  if (!tweet) {
    const error = new Error("Could not find the tweet with that id");
    return next(error);
  }

  try {
    if (tweet.rts.includes(userId)) {
      tweet.rts.pull(userId);
      await tweet.save();
    } else {
      tweet.rts.push(userId);
      await tweet.save();
    }
  } catch (err) {
    const error = new Error("OOps it failed");
    return next(error);
  }

  res.json({ tweet: "tweet rted !" });
};

exports.addTweet = addTweet;
exports.getAllTweets = getAllTweets;
exports.getTweetsByUserName = getTweetsByUserName;
exports.getTweetsById = getTweetsById;
exports.updateTweet = updateTweet;
exports.deleteTweet = deleteTweet;
exports.likeTweet = likeTweet;
exports.rtTweet = rtTweet;
