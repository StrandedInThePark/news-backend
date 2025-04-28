// const db = require("./db/connection");
const express = require("express");

const app = express();
app.use(express.json());

const getApi = require("./app/controllers/api.controllers");
const { getAllTopics } = require("./app/controllers/topics.controllers");

app.get("/api", getApi);

app.get("/api/topics", getAllTopics);

app.all("/{*allOtherURLs}", (req, res) => {
  res.status(404).send({ msg: "Invalid URL!" });
});

module.exports = app;
