const { selectArticleByArticleId } = require("../models/articles.models");
const {
  selectCommentsByArticleId,
  insertCommentToArticle,
  modelDeleteCommentByCommentId,
  selectCommentByCommentId,
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

const deleteCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;

  //   const pendingSelectCommentById = selectCommentById(comment_id);
  //   const pendingModelDeleteCommentByCommentId =
  //     modelDeleteCommentByCommentId(comment_id);

  return modelDeleteCommentByCommentId(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

const getCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  return selectCommentByCommentId(comment_id).then((comment) => {
    res.status(200).send({ comment });
  });
};

module.exports = {
  getCommentsByArticleId,
  postCommentToArticle,
  deleteCommentByCommentId,
  getCommentByCommentId,
};
