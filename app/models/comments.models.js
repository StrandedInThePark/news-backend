const db = require("../../db/connection");

const selectCommentsByArticleId = (articleId) => {
  return db
    .query(`SELECT * FROM comments WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      return rows;
    });
};

module.exports = { selectCommentsByArticleId };
