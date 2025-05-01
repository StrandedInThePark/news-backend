const db = require("../../db/connection");

const selectArticleByArticleId = (articleId) => {
  return db
    .query(
      `WITH mainArticlesInfo AS
(SELECT *
FROM articles
WHERE article_id = $1
),

commentCountInfo AS
(SELECT article_id, COUNT(comment_id)::INT
AS comment_count
FROM comments
GROUP BY article_id)

SELECT mainArticlesInfo.*, COALESCE(commentCountInfo.comment_count, 0) AS comment_count FROM mainArticlesInfo

LEFT JOIN commentCountInfo ON mainArticlesInfo.article_id = commentCountInfo.article_id`,
      [articleId]
    )
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

module.exports = {
  selectArticleByArticleId,
  selectAllArticles,
  updateVotesOnArticle,
  selectCommentsByArticleId,
  insertCommentToArticle,
};
