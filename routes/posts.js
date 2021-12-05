var express = require("express");
var router = express.Router();
const postsController = require("../controllers/postsController");

router.get("/", postsController.index);

module.exports = router;
