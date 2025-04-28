const {
  selectArticleByArticleId,
  selectAllArticles,
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
    console.log(articles, "articles");
  });
};

module.exports = { getArticleByArticleId, getAllArticles };
