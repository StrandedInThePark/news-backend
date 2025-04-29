const { selectArticleByArticleId } = require("../models/articles.models");
const {
  selectCommentsByArticleId,
  insertCommentToArticle,
} = require("../models/comments.models");

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const pendingArticleById = selectArticleByArticleId(article_id);
  const pendingSelectCommentsById = selectCommentsByArticleId(article_id);
  Promise.all([pendingSelectCommentsById, pendingArticleById]) //result promise first, validity check promise second
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

const postCommentToArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  const pendingSelectArticleById = selectArticleByArticleId(article_id);
  const pendingInsertCommentsById = insertCommentToArticle(
    article_id,
    username,
    body
  );
  Promise.all([pendingInsertCommentsById, pendingSelectArticleById])
    .then(([newComment]) => {
      res.status(200).send({ newComment });
    })
    .catch(next);
};

module.exports = { getCommentsByArticleId, postCommentToArticle };
