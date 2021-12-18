var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  recieved_friend_requests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  sent_friend_requests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
});

module.exports = mongoose.model("User", UserSchema);
