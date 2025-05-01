const commentsRouter = require("express").Router();

const {
  deleteCommentByCommentId,
  getCommentByCommentId,
  patchVoteByCommentId,
} = require("../controllers/comments.controllers");

commentsRouter.delete("/:comment_id", deleteCommentByCommentId);
commentsRouter.get("/:comment_id", getCommentByCommentId);
commentsRouter.patch("/:comment_id", patchVoteByCommentId);

module.exports = commentsRouter;
