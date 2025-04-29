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

const insertCommentToArticle = (articleId, username, body) => {
  return db
    .query(
      `INSERT INTO comments (article_id, author, body) 
        VALUES ($1, $2, $3)
        RETURNING *`,
      [articleId, username, body]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = { selectCommentsByArticleId, insertCommentToArticle };
