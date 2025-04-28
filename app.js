// const db = require("./db/connection");
const express = require("express");

const app = express();
app.use(express.json());

const getApi = require("./app/controllers/api.controllers");
const { getAllTopics } = require("./app/controllers/topics.controllers");
const {
  getArticleByArticleId,
} = require("./app/controllers/articles.controllers");

app.get("/api", getApi);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticleByArticleId);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Invalid URL!" });
});

module.exports = app;
