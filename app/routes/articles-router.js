const articlesRouter = require("express").Router();

const {
  getArticleByArticleId,
  getAllArticles,
  patchVotesOnArticle,
  getCommentsByArticleId,
  postCommentToArticle,
} = require("../controllers/articles.controllers");

articlesRouter.get("/", getAllArticles);
articlesRouter.get("/:article_id", getArticleByArticleId);
articlesRouter.patch("/:article_id", patchVotesOnArticle);
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postCommentToArticle);

module.exports = articlesRouter;
