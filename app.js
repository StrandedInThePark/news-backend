// const db = require("./db/connection");
const express = require("express");

const app = express();
app.use(express.json());

const getApi = require("./app/controllers/api.controllers");

app.get("/api", getApi);

app.all("/{*anyOtherUrl}", (req, res) => {
  res.status(404).send({ msg: "Invalid URL!" });
});

module.exports = app;
