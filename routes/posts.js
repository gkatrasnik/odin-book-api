var express = require("express");
var router = express.Router();
const postsController = require("../controllers/postsController");

router.get("/", postsController.index);

router.post(
  "/:userId/newpost",
  passport.authenticate("jwt", { session: false }),
  postsController.newpost_POST
);

module.exports = router;
