const db = require("../../db/connection");

const selectArticleByArticleId = (articleId) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found!" });
      } else {
        return rows[0];
      }
    });
};

const selectAllArticles = () => {
  return db
    .query(
      `SELECT author, title, article_id, topic, created_at, votes, article_img_url, comment_count FROM articles
      JOIN comments ON comments.article_id = articles.article_id`
    )
    .then(({ rows }) => {
      return rows;
    });
};

module.exports = { selectArticleByArticleId, selectAllArticles };
