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
  if (inc_votes === 0) {
    return Promise.reject({ status: 422, msg: "Unprocessable entity!" });
  }
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  }
  const { article_id } = req.params;
  const pendingSelectArticleById = selectArticleByArticleId(article_id);
  const pendingUpdateVotesOnArticle = updateVotesOnArticle(
    inc_votes,
    article_id
  );
  return Promise.all([pendingUpdateVotesOnArticle, pendingSelectArticleById])
    .then(([updatedArticle]) => {
      res.status(200).send({ updatedArticle });
    })
    .catch(next);
};

module.exports = { getArticleByArticleId, getAllArticles, patchVotesOnArticle };
