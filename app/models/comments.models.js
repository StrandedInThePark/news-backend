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
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  } else {
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
  }
};

const modelDeleteCommentByCommentId = (commentId) => {
  return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [
    commentId,
  ]);
};

const selectCommentByCommentId = (commentId) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [commentId])
    .then(({ rows }) => {
      console.log(rows[0]);
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found!" });
      } else {
        return rows[0];
      }
    });
};

module.exports = {
  selectCommentsByArticleId,
  insertCommentToArticle,
  modelDeleteCommentByCommentId,
  selectCommentByCommentId,
};
