const db = require("../../db/connection");

const selectCommentsByArticleId = (articleId) => {
  return db
    .query(
      `SELECT * FROM comments 
        WHERE article_id = $1
        ORDER BY created_at ASC`,
      [articleId]
    )
    .then(({ rows }) => {
      return rows;
    });
};

module.exports = { selectCommentsByArticleId };
