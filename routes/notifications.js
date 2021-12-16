var express = require("express");
var router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const passport = require("passport");

router.get("/", notificationsController.index);

module.exports = router;
