const db = require("../../db/connection");

const selectAllUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

module.exports = { selectAllUsers };
