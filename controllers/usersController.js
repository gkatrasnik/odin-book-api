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
