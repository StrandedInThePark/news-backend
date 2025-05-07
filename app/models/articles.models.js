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

const selectAllArticles = (sort_by, order, topic, limit = 10, p) => {
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
  const sortByGreenlist = ["created_at", "votes", "topic", "author", "title"];
  const orderGreenlist = ["asc", "desc"];
  const sortByRedlist = ["body", "article_img_url"];
  //topic handling
  if (topic) {
    queryStr += ` WHERE topic = '${topic}'`;
  }
  //sort_by handling
  if (!sort_by) {
    queryStr += ` ORDER BY created_at`;
  }
  if (sort_by) {
    if (sortByGreenlist.includes(sort_by)) {
      queryStr += ` ORDER BY ${sort_by}`;
    }
    if (sortByRedlist.includes(sort_by)) {
      return Promise.reject({ status: 401, msg: "Unauthorised request!" });
    }
  }
  //400 rejects
  if (
    (sort_by && !sortByGreenlist.includes(sort_by)) ||
    sort_by === "" ||
    (order && !orderGreenlist.includes(order.toLowerCase())) ||
    order === "" ||
    topic === ""
  ) {
    return Promise.reject({ status: 400, msg: "Invalid request!" });
  }
  //order handling
  if (!order) {
    queryStr += ` DESC`;
  }
  if (order && orderGreenlist.includes(order.toLowerCase())) {
    queryStr += ` ${order}`;
  }
  //greenlist limit and p as numbers
  if (limit) {
    if (isNaN(limit) || limit < 1) {
      return Promise.reject({ status: 401, msg: "Unauthorised request!" });
    }
  }
  if (p) {
    if (isNaN(p) || p < 1) {
      return Promise.reject({ status: 401, msg: "Unauthorised request!" });
    }
  }
  queryStr += ` LIMIT ${limit}`; //set results limit per page
  if (p) {
    let offSetRows = limit * (p - 1); //select start page
    queryStr += ` OFFSET ${offSetRows}`;
  }
  return db.query(queryStr).then(({ rows: articles }) => {
    if (articles.length === 0 && p > 0) {
      return Promise.reject({ status: 404, msg: "This page does not exist!" });
    } //if page too high for results, reject
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

const selectCommentsByArticleId = (articleId, limit = 10, p) => {
  let queryStr = `SELECT * FROM comments 
        WHERE article_id = $1
        ORDER BY created_at ASC`;

  if (limit) {
    if (isNaN(limit) || limit < 1) {
      return Promise.reject({ status: 401, msg: "Unauthorised request!" });
    }
  }
  if (p) {
    if (isNaN(p) || p < 1) {
      return Promise.reject({ status: 401, msg: "Unauthorised request!" });
    }
  }
  queryStr += ` LIMIT ${limit}`; //set results limit per page
  if (p) {
    let offSetRows = limit * (p - 1); //select start page
    queryStr += ` OFFSET ${offSetRows}`;
  }
  return db.query(queryStr, [articleId]).then(({ rows: articles }) => {
    if (articles.length === 0 && p > 0) {
      return Promise.reject({ status: 404, msg: "This page does not exist!" });
    } //if page too high for results, reject
    return articles;
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

const insertNewArticle = (author, title, body, topic, article_img_url) => {
  return db
    .query(
      `INSERT INTO articles (author, title, body, topic, article_img_url) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING article_id`,
      [author, title, body, topic, article_img_url]
    )
    .then(({ rows }) => {
      const articleId = rows[0].article_id;
      return db.query(
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
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

const modelDeleteArticleById = (articleId) => {
  return db.query(
    `DELETE FROM articles
    WHERE article_id = $1 RETURNING *`,
    [articleId]
  );
};
module.exports = {
  selectArticleByArticleId,
  selectAllArticles,
  updateVotesOnArticle,
  selectCommentsByArticleId,
  insertCommentToArticle,
  insertNewArticle,
  modelDeleteArticleById,
};
