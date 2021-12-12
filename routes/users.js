var express = require("express");
var router = express.Router();
const usersController = require("../controllers/usersController");
const passport = require("passport");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  usersController.list_GET
);

router.post("/login", usersController.login_POST);

router.post("/register", usersController.register_POST);

router.get(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  usersController.profile_GET
);

module.exports = router;
