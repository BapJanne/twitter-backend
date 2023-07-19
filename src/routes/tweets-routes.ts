import express from "express";
const { check } = require("express-validator");
const checkAuth = require("../middlewares/check-auth");

const tweetsControllers = require("../controllers/tweets-controller");

const router = express.Router();

router.get("/", tweetsControllers.getAllTweets);

router.get("/profil/:uid", tweetsControllers.getTweetsByUserName);

router.get("/:tid", tweetsControllers.getTweetsById);

router.use(checkAuth);

router.post(
  "/newTweet",
  [check("tweetContent").isLength({ min: 1, max: 255 })],
  tweetsControllers.addTweet
);

router.delete("/:tid", tweetsControllers.deleteTweet);

router.patch(
  "/:tid",
  [
    check("tweetContent").isLength({ max: 255 }),
    check("tweetContent").notEmpty(),
  ],
  tweetsControllers.updateTweet
);

router.patch("/likes/:tid", tweetsControllers.likeTweet);
router.patch("/rts/:tid", tweetsControllers.rtTweet);

module.exports = router;
