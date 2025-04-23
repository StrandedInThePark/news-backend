const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createRef } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query("DROP TABLE IF EXISTS comments;")
    .then(() => {
      db.query("DROP TABLE IF EXISTS articles;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS users;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS topics;");
    })
    .then(() => {
      return db.query(
        "CREATE TABLE topics (slug VARCHAR(200) PRIMARY KEY, description VARCHAR(300), img_url VARCHAR(1000));"
      );
    })
    .then(() => {
      return db.query(
        "CREATE TABLE users (username VARCHAR(150) PRIMARY KEY, name VARCHAR(150), avatar_url VARCHAR(1000));"
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE articles 
        (article_id SERIAL PRIMARY KEY, 
        title VARCHAR(300),
        topic VARCHAR(200) REFERENCES topics(slug), 
        author VARCHAR(200) REFERENCES users(username), 
        body TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        votes INT DEFAULT 0, 
        article_img_url VARCHAR(1000));`
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE comments 
        (comment_id SERIAL PRIMARY KEY, 
        article_id INT REFERENCES articles(article_id), 
        body TEXT, 
        votes INT DEFAULT 0, 
        author VARCHAR(200) REFERENCES users(username),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
      );
    })
    .then(() => {
      //format the data
      const formattedTopicData = topicData.map((topic) => {
        return [topic.slug, topic.description, topic.img_url];
      });
      //pass it to pg format and get a string
      const insertIntoTopicQuery = format(
        `INSERT INTO topics VALUES %L`,
        formattedTopicData
      );
      //pass the string to db.query
      return db.query(insertIntoTopicQuery);
    })
    .then(() => {
      const formattedUserData = userData.map((user) => {
        return [user.username, user.name, user.avatar_url];
      });
      const insertIntoUserQuery = format(
        `INSERT INTO users VALUES %L`,
        formattedUserData
      );
      return db.query(insertIntoUserQuery);
    })
    .then(() => {
      //uses util to convert created_at to correct format - leaves other values as they were
      const formattedArticleData = articleData.map((article) => {
        const correctArticle = convertTimestampToDate(article);
        // console.log(correctArticles, "corrected");
        return [
          correctArticle.title,
          correctArticle.topic,
          correctArticle.author,
          correctArticle.body,
          correctArticle.created_at,
          correctArticle.votes,
          correctArticle.article_img_url,
        ];
      });
      const insertIntoArticleQuery = format(
        `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING*;`, //RETURNS WHAT HAS BEEN DONE AS WELL
        formattedArticleData
      );
      return db.query(insertIntoArticleQuery);
    })
    .then((result) => {
      const lookupObject = createRef(result.rows);
      const formattedCommentData = commentData.map((comment) => {
        const convertedComment = convertTimestampToDate(comment);
        return [
          lookupObject[convertedComment.article_title],
          convertedComment.body,
          convertedComment.votes,
          convertedComment.author,
          convertedComment.created_at,
        ];
      });
      const insertIntoCommentQuery = format(
        `INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L`,
        formattedCommentData
      );
      return db.query(insertIntoCommentQuery);
    })
    .then(() => {
      console.log("Seeded successfully.");
    });
};

module.exports = seed;
