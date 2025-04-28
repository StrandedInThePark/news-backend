const { selectCommentsByArticleId } = require("../models/comments.models");

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return selectCommentsByArticleId(article_id).then((comments) => {
    res.status(200).send({ comments });
  });
};

module.exports = { getCommentsByArticleId };
