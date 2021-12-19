var express = require("express");
var router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const passport = require("passport");

router.get("/", notificationsController.index);

//delete notification
router.delete(
  "/:notificationId",
  passport.authenticate("jwt", { session: false }),
  notificationsController.notification_DELETE
);

module.exports = router;
