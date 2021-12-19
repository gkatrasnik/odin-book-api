var express = require("express");
var router = express.Router();
const postsController = require("../controllers/postsController");
const passport = require("passport");
var commentsRouter = require("./comments");

//nested comments router?
router.use("/:postId/comments", commentsRouter);

//add new post
router.post(
  "/:userId/new",
  passport.authenticate("jwt", { session: false }),
  postsController.new_post_POST
);

// get one post
router.get(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  postsController.post_GET
);

// delete post
router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  postsController.post_DELETE
);

// like post
router.post(
  "/:postId/like",
  passport.authenticate("jwt", { session: false }),
  postsController.like_post_POST
);

//get list of all posts(edit to only get posts of my friends)---------------------
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  postsController.posts_list_GET
);

module.exports = router;
