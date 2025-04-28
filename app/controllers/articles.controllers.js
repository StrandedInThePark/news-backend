const { selectArticleByArticleId } = require("../models/articles.models");

const getArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleByArticleId(article_id).then((article) => {
    res.status(200).send({ article });
  });
};

module.exports = { getArticleByArticleId };
