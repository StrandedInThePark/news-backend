const { disable } = require("../../app");
const db = require("../../db/connection");

const selectAllTopics = () => {
  return db.query(`SELECT slug, description FROM topics`).then(({ rows }) => {
    return rows;
  });
};

const selectTopicBySlug = (slug) => {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [slug])
    .then(({ rows: slugArr }) => {
      if (slugArr.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found!" });
      }
      return slugArr[0];
    });
};

const insertNewTopic = (slug, description) => {
  return db
    .query(
      `INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *`,
      [slug, description]
    )
    .then(({ rows: newTopic }) => {
      return newTopic[0];
    });
};

module.exports = { selectAllTopics, selectTopicBySlug, insertNewTopic };
