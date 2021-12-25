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

//get user notifications and requests
router.get(
  "/:userId/notifications",
  passport.authenticate("jwt", { session: false }),
  usersController.notifications_GET
);

//-------------------FRIEND REQUESTS---------------------------------

// Send friend request
router.post(
  "/:userId/send-request",
  passport.authenticate("jwt", { session: false }),
  usersController.send_friend_request_POST
);

// accept friend request
router.post(
  "/:userId/accept-request",
  passport.authenticate("jwt", { session: false }),
  usersController.accept_friend_request_POST
);

// deny friend request
router.post(
  "/:userId/deny-request",
  passport.authenticate("jwt", { session: false }),

  usersController.deny_friend_request_DELETE
);

// cancel sent friend request (unsend)
router.post(
  "/:userId/unsend-request",
  passport.authenticate("jwt", { session: false }),

  usersController.unsend_friend_request_DELETE
);

// delete friend (unfriend)
router.post(
  "/:userId/delete-friend",
  passport.authenticate("jwt", { session: false }),
  usersController.delete_friend_DELETE
);

module.exports = router;
