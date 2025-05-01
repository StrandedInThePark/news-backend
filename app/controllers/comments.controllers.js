const {
  modelDeleteCommentByCommentId,
  selectCommentByCommentId,
  updateVotesOnComment,
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

const patchVoteByCommentId = (req, res, next) => {
  const { inc_votes } = req.body;
  const { comment_id } = req.params;
  if (inc_votes === 0) {
    return Promise.reject({ status: 422, msg: "Unprocessable entity!" });
  }
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  }
  const pendingSelectCommentById = selectCommentByCommentId(comment_id);
  const pendingUpdateVotesOnComment = updateVotesOnComment(
    inc_votes,
    comment_id
  );
  return Promise.all([pendingUpdateVotesOnComment, pendingSelectCommentById])
    .then(([updatedComment]) => {
      res.status(200).send({ updatedComment });
    })
    .catch(next);
};

module.exports = {
  deleteCommentByCommentId,
  getCommentByCommentId,
  patchVoteByCommentId,
};
