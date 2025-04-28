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

app.all("/*splat", (req, res, next) => {
  res.status(404).send({ msg: "Invalid URL!" });
});

app.use((err, req, res, next) => {
  // console.log(err.code);
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid request!" });
  }
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
