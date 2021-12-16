var express = require("express");
var router = express.Router();
const usersController = require("../controllers/usersController");
const passport = require("passport");

//get all users
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  usersController.list_GET
);

//get my friends
router.get(
  "/:userId/friends",
  passport.authenticate("jwt", { session: false }),
  usersController.friends_GET
);

//get users that are NOT my friends
router.get(
  "/:userId/notfriends",
  passport.authenticate("jwt", { session: false }),
  usersController.notfriends_GET
);

//login
router.post("/login", usersController.login_POST);

//register
router.post("/register", usersController.register_POST);

//get user profile
router.get(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  usersController.profile_GET
);

module.exports = router;
