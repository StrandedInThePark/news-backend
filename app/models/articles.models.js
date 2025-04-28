const db = require("../../db/connection");

const selectArticleByArticleId = (articleId) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      return rows;
    });
};

module.exports = { selectArticleByArticleId };
