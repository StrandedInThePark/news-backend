const { selectAllTopics } = require("../models/topics.models");

const getAllTopics = (req, res, next) => {
  return selectAllTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

module.exports = { getAllTopics };
