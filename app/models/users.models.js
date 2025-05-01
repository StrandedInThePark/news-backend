const db = require("../../db/connection");

const selectAllUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

const selectUserByUsername = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows: user }) => {
      if (user.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found!" });
      } else {
        return user[0];
      }
    });
};

module.exports = { selectAllUsers, selectUserByUsername };
