const {
  selectArticleByArticleId,
  selectAllArticles,
  updateVotesOnArticle,
  selectCommentsByArticleId,
  insertCommentToArticle,
  insertNewArticle,
} = require("../models/articles.models");
const { selectTopicBySlug } = require("../models/topics.models");

const getArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleByArticleId(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

const getAllArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  const allowedKeys = ["sort_by", "order", "topic"];
  const invalidKeys = Object.keys(req.query).some(
    (key) => !allowedKeys.includes(key)
  );
  if (invalidKeys) {
    return Promise.reject({
      status: 400,
      msg: "Invalid or misspelt query parameter!",
    });
  }

  if (topic) {
    const pendingSelectTopicBySlug = selectTopicBySlug(topic);
    const pendingSelectAllArticles = selectAllArticles(sort_by, order, topic);
    return Promise.all([pendingSelectAllArticles, pendingSelectTopicBySlug])
      .then((articles) => {
        res.status(200).send({ articles: articles[0] });
      })
      .catch(next);
  }
  if (!topic) {
    return selectAllArticles(sort_by, order, topic)
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch(next);
  }
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
      res.status(201).send({ newComment });
    })
    .catch(next);
};

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

const postNewArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  if (!author || !title || !body || !topic) {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  }
  return insertNewArticle(author, title, body, topic, article_img_url)
    .then((newArticle) => {
      res.status(201).send({ newArticle });
    })
    .catch(next);
};

module.exports = {
  getArticleByArticleId,
  getAllArticles,
  patchVotesOnArticle,
  postCommentToArticle,
  getCommentsByArticleId,
  postNewArticle,
};
