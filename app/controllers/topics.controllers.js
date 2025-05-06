const {
  selectAllTopics,
  selectTopicBySlug,
  insertNewTopic,
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

const postNewTopic = (req, res, next) => {
  const { slug, description } = req.body;
  if (!slug || !description) {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  }
  return insertNewTopic(slug, description)
    .then((newTopic) => {
      res.status(201).send({ newTopic });
    })
    .catch(next);
};

module.exports = { getAllTopics, getTopicBySlug, postNewTopic };
