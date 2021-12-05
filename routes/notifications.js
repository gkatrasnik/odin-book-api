var express = require("express");
var router = express.Router();
const notificationsController = require("../controllers/notificationsController");

router.get("/", notificationsController.index);

module.exports = router;
