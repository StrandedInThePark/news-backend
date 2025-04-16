const db = require("./db/connection");

function queries() {
  return db
    .query("SELECT * FROM users;")
    .then((result) => {
      console.log("-----Query all users-----");

      console.log(result.rows);
    })
    .then(() => {
      return db.query(`SELECT title FROM articles WHERE topic = 'coding'`);
    })
    .then((result) => {
      console.log("-----Query all articles where topic is coding-----");
      console.log(result.rows);
    })
    .then(() => {
      return db.query("SELECT * FROM comments WHERE votes < 0");
    })
    .then((result) => {
      console.log("-----Query all comments where votes are less than 0-----");

      console.log(result.rows);
    })
    .then(() => {
      return db.query("SELECT slug FROM topics");
    })
    .then((result) => {
      console.log("-----Query all topics-----");
      console.log(result.rows);
    })
    .then(() => {
      return db.query(
        "SELECT title, author FROM articles WHERE author = 'grumpy19'"
      );
    })
    .then((result) => {
      console.log("-----Query all articles by grumpy19-----");
      console.log(result.rows);
    })
    .then(() => {
      return db.query("SELECT * FROM comments WHERE votes > 10");
    })
    .then((result) => {
      console.log("-----Query all comments with more than 10 votes-----");
      console.log(result.rows);
    })
    .catch((err) => {
      console.log(err);
    });
}
console.log(queries());
