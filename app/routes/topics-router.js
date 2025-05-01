const topicsRouter = require("express").Router();

const {
  getAllTopics,
  getTopicBySlug,
} = require("../controllers/topics.controllers");

topicsRouter.get("/", getAllTopics);

topicsRouter.get("/:slug", getTopicBySlug);

module.exports = topicsRouter;
