const {
  selectArticleByArticleId,
  selectAllArticles,
  updateVotesOnArticle,
} = require("../models/articles.models");

const getArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleByArticleId(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

const getAllArticles = (req, res, next) => {
  return selectAllArticles().then((articles) => {
    res.status(200).send({ articles });
  });
};

const patchVotesOnArticle = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;
  return updateVotesOnArticle(inc_votes, article_id).then((updatedArticle) => {
    res.status(200).send({ updatedArticle });
  });
};

module.exports = { getArticleByArticleId, getAllArticles, patchVotesOnArticle };
