const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");
const Notification = require("../models/notification");

exports.index = function (req, res, next) {
  res.json({ msg: "comments index response" });
};

//add comment
exports.new_comment_POST = async (req, res) => {
  const { userId } = req.body;
  const postId = req.params.postId; //UNDEFINED
  const text = req.body.text;

  console.log(postId);
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({
        success: false,
        msg: "Can not find post",
      });
    }

    const postAuthor = await User.findById(post.user._id);
    const currentUser = await User.findById(userId);
    const newComment = new Comment({
      text: text,
      user: userId,
    });

    const newNotification = new Notification({
      text: `You have new comment from ${currentUser.firstname} ${currentUser.lastname}`,
      from_user: userId, //currentUser id
      type: "comment",
    });

    const updatedNotificatoins = [
      ...postAuthor.notifications,
      newNotification._id,
    ];
    postAuthor.notifications = updatedNotificatoins;

    const updatedComments = [...post.comments, newComment._id];
    post.comments = updatedComments;

    const updatedPost = await post.save();
    await newComment.save();
    await postAuthor.save();
    await newNotification.save();

    return res.status(200).json({
      success: true,
      msg: "Comment added",
      post: updatedPost,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

//delete comment
exports.comment_DELETE = async (req, res) => {
  const { userId } = req.body;
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findById(commentId);
    const post = await Post.findById(postId);

    if (comment.user.toString() != userId) {
      return res.status(400).json({
        success: false,
        msg: "This is not your comment",
      });
    }

    await comment.remove();
    const updatedComments = post.comments.filter(
      (comment) => comment != commentId.toString()
    );

    post.comments = updatedComments;
    const updatedPost = await post.save();

    return res
      .status(200)
      .json({ success: true, msg: "Comment was deleted", post: updatedPost });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};
