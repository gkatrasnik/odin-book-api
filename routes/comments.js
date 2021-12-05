var express = require("express");
var router = express.Router();
const commentsController = require("../controllers/commentsController");

router.get("/", commentsController.index);

module.exports = router;
