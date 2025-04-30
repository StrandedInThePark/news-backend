// const db = require("./db/connection");
const express = require("express");

const app = express();
app.use(express.json());
const apiRouter = require("./app/routes/api-router.js");
app.use("/api", apiRouter);
const articlesRouter = require("./app/routes/articles-router.js");
app.use("/api/articles", articlesRouter);
// const getApi = require("./app/controllers/api.controllers");
const { getAllTopics } = require("./app/controllers/topics.controllers");
const {
  getArticleByArticleId,
  getAllArticles,
  patchVotesOnArticle,
} = require("./app/controllers/articles.controllers");
const {
  getCommentsByArticleId,
  postCommentToArticle,
  deleteCommentByCommentId,
  getCommentByCommentId,
} = require("./app/controllers/comments.controllers");
const { getAllUsers } = require("./app/controllers/users.controllers");
const {
  handlePSQLErrors,
  handleCustomErrors,
  catchAllErrors,
} = require("./app/controllers/errors.controllers");

// app.get("/api", getApi);

app.get("/api/topics", getAllTopics);

// app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id", getArticleByArticleId);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentToArticle);

app.patch("/api/articles/:article_id", patchVotesOnArticle);

app.delete("/api/comments/:comment_id", deleteCommentByCommentId);

app.get("/api/comments/:comment_id", getCommentByCommentId);

app.get("/api/users", getAllUsers);

app.all("/*splat", (req, res, next) => {
  res.status(404).send({ msg: "Invalid URL!" });
});

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(catchAllErrors);

module.exports = app;
