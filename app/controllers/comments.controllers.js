const {
  modelDeleteCommentByCommentId,
  selectCommentByCommentId,
} = require("../models/comments.models");

const deleteCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  const pendingSelectCommentByCommentId = selectCommentByCommentId(comment_id);
  const pendingModelDeleteCommentByCommentId =
    modelDeleteCommentByCommentId(comment_id);
  Promise.all([
    pendingModelDeleteCommentByCommentId,
    pendingSelectCommentByCommentId,
  ])
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
  deleteCommentByCommentId,
  getCommentByCommentId,
};
