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

const selectAllArticles = (sort_by, order) => {
  let queryStr = `WITH mainCommentsInfo AS
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
          ON mainCommentsInfo.article_id = commentCountInfo.article_id`;
  let queryArgs = [];
  let queryCount = 0;
  const sortByGreenlist = ["created_at", "votes", "topic", "author", "title"];
  const orderGreenlist = ["asc", "desc"];

  if (!sort_by) {
    queryStr += ` ORDER BY created_at`;
  }
  if (sort_by && sortByGreenlist.includes(sort_by)) {
    queryStr += ` ORDER BY ${sort_by}`;
  }
  if (!order) {
    queryStr += ` DESC`;
  }
  if (order && orderGreenlist.includes(order)) {
    queryStr += ` ${order}`;
  }
  console.log(queryStr, "query string");
  return db.query(queryStr).then(({ rows: articles }) => {
    return articles;
  });
};

// const selectAllArticles = (sort_by, order) => {

//   return db
//     .query(
//       `WITH mainCommentsInfo AS
//           (SELECT author, title, article_id, topic, created_at, votes, article_img_url
//           FROM articles),

//           commentCountInfo AS
//           (SELECT article_id, COUNT(comment_id)::INT
//           AS comment_count
//           FROM comments
//           GROUP BY article_id)

//           SELECT mainCommentsInfo.author,
//           mainCommentsInfo.title, mainCommentsInfo.article_id, mainCommentsInfo.topic, mainCommentsInfo.created_at, mainCommentsInfo.votes, mainCommentsInfo.article_img_url,
//           COALESCE(commentCountInfo.comment_count, 0) AS comment_count
//           FROM mainCommentsInfo

//           LEFT JOIN commentCountInfo
//           ON mainCommentsInfo.article_id = commentCountInfo.article_id
//           ORDER BY created_at DESC
//             `
//     )
//     .then(({ rows }) => {
//       return rows;
//     });
// };

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
