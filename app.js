// const db = require("./db/connection");
const express = require("express");

const app = express();
app.use(express.json());

const getApi = require("./app/controllers/api.controllers");
const { getAllTopics } = require("./app/controllers/topics.controllers");
const {
  getArticleByArticleId,
  getAllArticles,
} = require("./app/controllers/articles.controllers");
const {
  handlePSQLErrors,
  handleCustomErrors,
  catchAllErrors,
} = require("./app/controllers/errors.controllers");

app.get("/api", getApi);

app.get("/api/topics", getAllTopics);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id", getArticleByArticleId);

app.all("/*splat", (req, res, next) => {
  res.status(404).send({ msg: "Invalid URL!" });
});

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(catchAllErrors);

module.exports = app;
