var express = require("express");
var router = express.Router();
const postsController = require("../controllers/postsController");
const passport = require("passport");

router.get("/", postsController.index);

router.post(
  "/:userId/newpost",
  passport.authenticate("jwt", { session: false }),
  postsController.newpost_POST
);

module.exports = router;
