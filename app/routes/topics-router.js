const topicsRouter = require("express").Router();

const {
  getAllTopics,
  getTopicBySlug,
  postNewTopic,
} = require("../controllers/topics.controllers");

topicsRouter.get("/", getAllTopics);

topicsRouter.get("/:slug", getTopicBySlug);

topicsRouter.post("/", postNewTopic);

module.exports = topicsRouter;
