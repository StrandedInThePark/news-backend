const articlesRouter = require("express").Router();

const {
  getArticleByArticleId,
  getAllArticles,
  patchVotesOnArticle,
} = require("../controllers/articles.controllers");

articlesRouter.get("/", getAllArticles);

module.exports = articlesRouter;
