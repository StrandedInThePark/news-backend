const db = require("../../db/connection");

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
  const { sort_by, order, topic } = req.query;
  //function to check topic existence - rejects if it does not
  const checkTopicExists = (topicName) => {
    return db
      .query(`SELECT * FROM topics WHERE slug = $1`, [topicName])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Not found!" });
        } else {
          return true;
        }
      })
      .catch(next);
  };
  if (topic === "") {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  }
  if (topic) {
    checkTopicExists(topic);
  }
  let queryStr = `WITH mainCommentsInfo AS
          (SELECT author, title, article_id, topic, created_at, votes, article_img_url
          FROM articles),

          commentCountInfo AS
          (SELECT article_id, COUNT(comment_id)::INT
          AS comment_count
          FROM comments
          GROUP BY article_id)

          SELECT mainCommentsInfo.author,
          mainCommentsInfo.title, mainCommentsInfo.article_id, mainCommentsInfo.topic, mainCommentsInfo.created_at, mainCommentsInfo.votes, mainCommentsInfo.article_img_url,
          COALESCE(commentCountInfo.comment_count, 0) AS comment_count
          FROM mainCommentsInfo

          LEFT JOIN commentCountInfo 
          ON mainCommentsInfo.article_id = commentCountInfo.article_id`;
  const sortByGreenlist = ["created_at", "votes", "topic", "author", "title"];
  const orderGreenlist = ["asc", "desc"];
  const sortByRedlist = ["body", "article_img_url"];
  //topic handling
  if (topic) {
    queryStr += ` WHERE topic = '${topic}'`;
  }
  //sort_by handling
  if (!sort_by) {
    queryStr += ` ORDER BY created_at`;
  }
  if (sort_by) {
    if (sortByGreenlist.includes(sort_by)) {
      queryStr += ` ORDER BY ${sort_by}`;
    }
    if (sortByRedlist.includes(sort_by)) {
      return Promise.reject({ status: 401, msg: "Unauthorised request!" });
    }
  }
  //400 rejects
  if (
    (sort_by && !sortByGreenlist.includes(sort_by)) ||
    sort_by === "" ||
    (order && !orderGreenlist.includes(order.toLowerCase())) ||
    order === ""
  ) {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  }
  //order handling
  if (!order) {
    queryStr += ` DESC`;
  }
  if (order && orderGreenlist.includes(order.toLowerCase())) {
    queryStr += ` ${order}`;
  }
  return selectAllArticles(queryStr)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
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
