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

const selectAllArticles = (queryStr) => {
  return db.query(queryStr).then(({ rows: articles }) => {
    return articles;
  });
};

const updateVotesOnArticle = (voteIncrement, articleId) => {
  return db
    .query(
      `UPDATE articles SET votes = (votes + $1) WHERE article_id = $2 RETURNING *`,
      [voteIncrement, articleId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = {
  selectArticleByArticleId,
  selectAllArticles,
  updateVotesOnArticle,
};
