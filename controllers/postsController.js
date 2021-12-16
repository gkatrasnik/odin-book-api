const Post = require("../models/post");
const Comment = require("../models/comment");

exports.index = function (req, res, next) {
  res.json({ msg: "posts index response" });
};

//post new post
exports.newpost_POST = (req, res, next) => {
  const { userId, text } = req.body;
  const newPost = new Post({
    user: userId,
    text: text,
    comments: [],
    timestamp: Date.now(),
  });

  newPost
    .save()
    .then((post) => {
      res.status(200).json({ success: true, post });
    })
    .catch((err) => {
      return next(err);
    });
};

// get post
exports.post_GET = (req, res, next) => {
  Post.findById(req.params.postId)
    .populate("user")
    .populate("likes")
    .populate("comments")
    .exec(function (err, post) {
      if (err) {
        return res.status(500).json({ success: false, msg: err.message });
      }
      if (post == null) {
        const err = new Error("Not found");
        return res.status(404).json({ success: false, msg: err.message });
      }
      return res.status(200).json({ success: true, post: post });
    });
};

//delete post
exports.post_DELETE = (req, res) => {
  Post.findByIdAndDelete(req.params.postId, (err, deletedPost) => {
    if (err) {
      return res.status(409).json({ success: false, msg: err.message });
    } else {
      res.status(200).json({
        success: true,
        msg: "Post deleted",
        post: deletedPost,
      });
    }
  });

  //deletes all comments on this post too.
  Comment.deleteMany({ postId: req.params.postId })
    .then(function () {
      console.log("Data deleted"); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
};
