const express = require("express");

const app = express();
app.use(express.json());

const apiRouter = require("./app/routes/api-router.js");
const articlesRouter = require("./app/routes/articles-router.js");
const topicsRouter = require("./app/routes/topics-router.js");
const usersRouter = require("./app/routes/users-router.js");
const commentsRouter = require("./app/routes/comments-router.js");

app.use("/api", apiRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentsRouter);

const {
  handlePSQLErrors,
  handleCustomErrors,
  catchAllErrors,
} = require("./app/controllers/errors.controllers");

app.all("/*splat", (req, res, next) => {
  res.status(404).send({ msg: "Invalid URL!" });
});

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(catchAllErrors);

module.exports = app;
