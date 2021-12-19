require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var cors = require("cors");
var compression = require("compression");
var helmet = require("helmet");
require("./helpers/passport");

var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");
var commentsRouter = require("./routes/comments");
var notificationsRouter = require("./routes/notifications");

// mongoDB
var mongoose = require("mongoose");

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var app = express();
app.use(cors());
app.use(passport.initialize());

app.use(compression()); //Compress all routes
app.use(helmet());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/notifications", notificationsRouter);

module.exports = app;
