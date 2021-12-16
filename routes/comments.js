var express = require("express");
var router = express.Router();
const commentsController = require("../controllers/commentsController");
const passport = require("passport");

router.get("/", commentsController.index);

module.exports = router;
