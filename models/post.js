var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
