const { selectArticleByArticleId } = require("../models/articles.models");
const { selectCommentsByArticleId } = require("../models/comments.models");

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const pendingArticleById = selectArticleByArticleId(article_id);
  const pendingCommentsById = selectCommentsByArticleId(article_id);

  Promise.all([pendingCommentsById, pendingArticleById]) //result promise first, validity check promise second
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

module.exports = { getCommentsByArticleId };
