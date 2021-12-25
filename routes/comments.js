var express = require("express");
var router = express.Router({ mergeParams: true });
const commentsController = require("../controllers/commentsController");
const passport = require("passport");

//router.get("/", commentsController.index);

//add comment
router.post(
  "/new-comment",
  passport.authenticate("jwt", { session: false }),
  commentsController.new_comment_POST
);

//delete comment
router.post(
  "/:commentId/delete",
  passport.authenticate("jwt", { session: false }),
  commentsController.comment_DELETE
);

module.exports = router;
