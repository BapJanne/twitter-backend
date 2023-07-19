import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tweetSchema = new Schema({
  tweetContent: { type: String, required: true },
  rts: [{ type: String }],
  likes: [{ type: String }],
  authorName: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Tweet", tweetSchema);
