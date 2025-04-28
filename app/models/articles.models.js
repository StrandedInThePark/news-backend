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
      `WITH mainCommentsInfo AS
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
          ON mainCommentsInfo.article_id = commentCountInfo.article_id
          ORDER BY created_at DESC
            `
    )
    .then(({ rows }) => {
      return rows;
    });
};

module.exports = { selectArticleByArticleId, selectAllArticles };
