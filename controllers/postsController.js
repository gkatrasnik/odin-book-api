const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");
const Notification = require("../models/notification");

//post new post
exports.new_post_POST = (req, res, next) => {
  const { text } = req.body;
  const userId = req.params.userId;
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

// like post
exports.like_post_POST = async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    const likesArray = post.likes;
    const postAuthor = await User.findById(post.user._id);
    const currentUser = await User.findById(userId);

    //if user already liked the post, unlike post
    if (likesArray.includes(userId)) {
      const updatedLikesArray = likesArray.filter(
        (like) => like != userId.toString()
      );

      post.likes = updatedLikesArray;
      await post.save();
    } else {
      const newNotification = new Notification({
        text: `You have new like from ${currentUser.firstname} ${currentUser.lastname}`,
        from_user: userId, //currentUser id
        type: "like",
      });

      const updatedNotificatoins = [
        ...postAuthor.notifications,
        newNotification._id,
      ];
      postAuthor.notifications = updatedNotificatoins;
      const updatedLikes = [...likesArray, userId];
      post.likes = updatedLikes;

      await postAuthor.save();
      await newNotification.save();
      await post.save();
    }
    res.status(200).json({
      success: true,
      post: post,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      msg: err.message,
    });
  }
};

//get list of friends posts(including my posts)
exports.posts_list_GET = async (req, res) => {
  try {
    const { userId } = req.body;

    const currentUser = await User.findById(userId);
    const friendsList = currentUser.friends;

    friendsList.push(userId);

    const posts = await Post.find({ user: { $in: friendsList } })
      .populate("user", "-password")
      .populate({
        path: "comments",
        populate: { path: "user" },
        options: { sort: { createdAt: -1 } },
      })
      .populate("likes", "-password")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      msg: "All posts from friends",
      posts: posts,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      msg: "Posts coudn't be find!",
      err: err.message,
    });
  }
};

//get list of specific user
exports.user_posts_list_GET = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    console.log(userId);
    const posts = await Post.find({ user: user })
      .populate("user", "-password")
      .populate({
        path: "comments",
        populate: { path: "user" },
        options: { sort: { createdAt: -1 } },
      })
      .populate("likes", "-password")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      msg: "All posts from user",
      posts: posts,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      msg: "Posts coudn't be find!",
      err: err.message,
    });
  }
};
