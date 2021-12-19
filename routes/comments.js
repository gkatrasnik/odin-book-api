var express = require("express");
var router = express.Router();
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
router.delete(
  "/:commentId",
  passport.authenticate("jwt", { session: false }),
  commentsController.comment_DELETE
);

module.exports = router;
