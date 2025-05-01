const commentsRouter = require("express").Router();

const {
  deleteCommentByCommentId,
  getCommentByCommentId,
} = require("../controllers/comments.controllers");

commentsRouter.delete("/:comment_id", deleteCommentByCommentId);
commentsRouter.get("/:comment_id", getCommentByCommentId);

module.exports = commentsRouter;
