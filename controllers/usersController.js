const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const helper = require("../helpers/helper");

exports.register_POST = (req, res, next) => {
  const { username, password, firstname, lastname } = req.body;

  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }
    if (user) {
      return res.status(400).json({
        success: false,
        msg: "User with this name already exists!",
      });
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: `Coudn't make a hashed password `,
          err: err,
        });
      }
      const newUser = new User({
        username: username,
        firstname: firstname,
        lastname: lastname,
        password: hashedPassword,
      });

      newUser
        .save()
        .then((user) => {
          const jwt = helper.issueJWT(user);

          res.status(200).json({
            success: true,
            user: user,
            token: jwt.token,
            expiresIn: jwt.expires,
          });
        })
        .catch((err) => next(err));
    });
  });
};

exports.login_POST = async (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .json({ success: false, msg: "User could not be found" });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const tokenObject = helper.issueJWT(user);

          res.status(200).json({
            success: true,
            user: user,
            token: tokenObject.token,
            expiresIn: tokenObject.expires,
          });
        } else {
          res
            .status(401)
            .json({ success: false, msg: "You entered the wrong password!" });
        }
      });
    })
    .catch((err) => {
      next(err);
    });
};

//get user profile
exports.profile_GET = (req, res, next) => {
  User.findById(req.params.userId)
    .populate("friends")
    .exec(function (err, user) {
      if (err) {
        return res.status(500).json({ success: false, msg: err.message });
      }
      if (user == null) {
        const err = new Error("User not found");
        return res.status(404).json({ success: false, msg: err.message });
      }
      //if user found, search for posts where user === user
      Post.find({ user: req.params.userId })
        .populate("user")
        .populate("likes")
        .populate("comments")
        .exec(function (err, posts) {
          if (err) {
            return res.status(500).json({ success: false, msg: err.message });
          }
          if (posts == null) {
            const err = new Error("Posts not found");
            return res.status(404).json({ success: false, msg: err.message });
          }

          return res
            .status(200)
            .json({ success: true, user: user, posts: posts });
        });
    });
};

//get list of users
exports.list_GET = (req, res, next) => {
  User.find()
    .sort([["username", "ascending"]])
    .exec(function (err, list_users) {
      if (err) {
        return next(err);
      }
      //Successful, so send
      res.json(list_users);
    });
};

//get list of friends
exports.friends_GET = (req, res, next) => {
  User.find({ friends: req.params.userId })
    .sort([["username", "ascending"]])
    .exec(function (err, list_friends) {
      if (err) {
        return next(err);
      }
      //Successful, so send
      res.status(200).json({ success: true, friends: list_friends });
    });
};

//get list of NOT friends
exports.notfriends_GET = (req, res, next) => {
  User.find({ friends: { $ne: req.params.userId } })
    .sort([["username", "ascending"]])
    .exec(function (err, notlist_friends) {
      if (err) {
        return next(err);
      }
      //Successful, so send
      res.status(200).json({ success: true, notfriends: notlist_friends });
    });
};

//----------------------FRIEND REQUESTS---------------------------------

//send friend request
exports.send_friend_request_POST = async (req, res) => {
  const { userId } = req.body;
  const secondUserId = req.params.userId;

  try {
    const currentUser = await User.findById(userId);
    const secondUser = await User.findById(secondUserId);

    if (currentUser._id.toString() === secondUser._id.toString()) {
      return res.status(400).json({
        success: false,
        msg: "You can not send friend request to your self",
      });
    } else if (
      secondUser.recieved_friend_requests.includes(currentUser._id.toString())
    ) {
      return res.status(400).json({
        success: false,
        msg: "You already sent friend request to this user",
      });
    } else if (secondUser.friends.includes(currentUser._id.toString())) {
      return res.status(400).json({
        success: false,
        msg: "User is already your friend!",
      });
    } else {
      //if everything is ok, add ids to friend requests
      currentUser.sent_friend_requests.push(secondUser._id);
      secondUser.recieved_friend_requests.push(currentUser._id);

      await currentUser.save();
      await secondUser.save();

      return res.status(200).json({
        success: true,
        currentUser: currentUser,
        secondUser: secondUser,
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

// accept friend request
exports.accept_friend_request_POST = async (req, res) => {
  const { userId } = req.body;
  const secondUserId = req.params.userId;

  try {
    const currentUser = await User.findById(userId);
    const secondUser = await User.findById(secondUserId);

    if (
      !currentUser.recieved_friend_requests.includes(secondUser._id) ||
      !secondUser.sent_friend_requests.includes(currentUser._id)
    ) {
      return res.status(400).json({
        success: false,
        msg: "You do not have friend request from this user",
      });
    } else {
      //if everything is ok

      // delete ids from recieved friend request and sent friend requests
      const updatedRecievedFriendRequests =
        currentUser.recieved_friend_requests.filter(
          (request) => request != secondUser._id.toString()
        );
      const updatedSentFriendRequests = secondUser.sent_friend_requests.filter(
        (request) => request != currentUser._id.toString()
      );

      currentUser.recieved_friend_requests = updatedRecievedFriendRequests;
      secondUser.sent_friend_requests = updatedSentFriendRequests;

      // add ids to friends for both users...
      const currentUsersFriends = [...currentUser.friends, secondUser._id];
      const secondUsersFriends = [...secondUser.friends, currentUser._id];
      currentUser.friends = currentUsersFriends;
      secondUser.friends = secondUsersFriends;

      const updatedCurrentUser = await currentUser.save();
      const updatedSecondUser = await secondUser.save();

      return res.status(200).json({
        success: true,
        msg: "Accepted friend request",
        currentUser: updatedCurrentUser,
        secondUser: updatedSecondUser,
      });
    }
  } catch (err) {
    return res.status(400).json({ msg: err.message });
  }
};

//deny friend request
exports.deny_friend_request_DELETE = async (req, res) => {
  const { userId } = req.body;
  const secondUserId = req.params.userId;

  try {
    const currentUser = await User.findById(userId);
    const secondUser = await User.findById(secondUserId);

    if (!secondUser.sent_friend_requests.includes(currentUser._id.toString())) {
      return res
        .status(404)
        .json({ success: false, msg: "Cannot find a friend request" });
    } else {
      //if everything is ok

      // delete ids from recieved friend request and sent friend requests
      const updatedRecievedFriendRequests =
        currentUser.recieved_friend_requests.filter(
          (request) => request != secondUser._id.toString()
        );
      const updatedSentFriendRequests = secondUser.sent_friend_requests.filter(
        (request) => request != currentUser._id.toString()
      );

      currentUser.recieved_friend_requests = updatedRecievedFriendRequests;
      secondUser.sent_friend_requests = updatedSentFriendRequests;

      const updatedCurrentUser = await currentUser.save();
      const updatedSecondUser = await secondUser.save();

      return res.status(200).json({
        success: true,
        msg: "Friend request denied",
        currentUser: updatedCurrentUser,
        secondUser: updatedSecondUser,
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

// usend friend request
exports.unsend_friend_request_DELETE = async (req, res) => {
  const { userId } = req.body;
  const secondUserId = req.params.userId;

  try {
    const currentUser = await User.findById(userId);
    const secondUser = await User.findById(secondUserId);

    if (
      !secondUser.recieved_friend_requests.includes(currentUser._id.toString())
    ) {
      return res
        .status(404)
        .json({ success: false, msg: "Cannot find a friend request" });
    } else {
      //if everything is ok

      // delete ids from sent friend request and recieved friend requests
      const updatedSentFriendRequests = currentUser.sent_friend_requests.filter(
        (request) => request != secondUser._id.toString()
      );
      const updatedRecievedFriendRequests =
        secondUser.recieved_friend_requests.filter(
          (request) => request != currentUser._id.toString()
        );

      currentUser.sent_friend_requests = updatedSentFriendRequests;
      secondUser.recieved_friend_requests = updatedRecievedFriendRequests;

      const updatedCurrentUser = await currentUser.save();
      const updatedSecondUser = await secondUser.save();

      return res.status(200).json({
        success: true,
        msg: "Friend request unsent",
        currentUser: updatedCurrentUser,
        secondUser: updatedSecondUser,
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

//delete friend
exports.delete_friend_DELETE = async (req, res) => {
  const { userId } = req.body;
  const secondUserId = req.params.userId;

  try {
    const currentUser = await User.findById(userId);
    const secondUser = await User.findById(secondUserId);

    if (
      !currentUser.friends.includes(secondUser._id) ||
      !secondUser.friends.includes(currentUser._id)
    ) {
      return res.status(400).json({
        success: false,
        msg: "You are not friend with this user",
      });
    } else {
      //if everything is ok

      // delete ids from friends
      const updatedFriendsCurrentUser = currentUser.friends.filter(
        (friend) => friend != secondUser._id.toString()
      );
      const updatedFriendsSecondUser = secondUser.friends.filter(
        (friend) => friend != currentUser._id.toString()
      );

      currentUser.friends = updatedFriendsCurrentUser;
      secondUser.friends = updatedFriendsSecondUser;

      // add ids to friends for both users...

      currentUser.friends = updatedFriendsCurrentUser;
      secondUser.friends = updatedFriendsSecondUser;

      const updatedCurrentUser = await currentUser.save();
      const updatedSecondUser = await secondUser.save();

      return res.status(200).json({
        success: true,
        msg: "Friend removed",
        currentUser: updatedCurrentUser,
        secondUser: updatedSecondUser,
      });
    }
  } catch (err) {
    return res.status(400).json({ msg: err.message });
  }
};
