const db = require("../../db/connection");

const modelDeleteCommentByCommentId = (commentId) => {
  return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [
    commentId,
  ]);
};

const selectCommentByCommentId = (commentId) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [commentId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found!" });
      } else {
        return rows[0];
      }
    });
};

const updateVotesOnComment = (voteIncrement, commentId) => {
  return db
    .query(
      `UPDATE comments SET votes = (votes + $1) WHERE comment_id = $2 RETURNING *`,
      [voteIncrement, commentId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = {
  modelDeleteCommentByCommentId,
  selectCommentByCommentId,
  updateVotesOnComment,
};
