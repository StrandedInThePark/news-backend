const db = require("../../db/connection");

const selectAllTopics = () => {
  return db.query(`SELECT slug, description FROM topics`).then(({ rows }) => {
    return rows;
  });
};

module.exports = { selectAllTopics };
