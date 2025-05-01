const {
  selectAllTopics,
  selectTopicBySlug,
} = require("../models/topics.models");

const getAllTopics = (req, res, next) => {
  return selectAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

const getTopicBySlug = (req, res, next) => {
  const { slug } = req.params;
  return selectTopicBySlug(slug)
    .then((topic) => {
      res.status(200).send({ topic });
    })
    .catch(next);
};

module.exports = { getAllTopics, getTopicBySlug };
