const db = require("../../db/connection");
const articles = require("../data/test-data/articles");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (articlesArr) => {
  //takes an array of article objects, gives title:id lookup
  if (articlesArr.length === 0) {
    return {};
  } else {
    const lookupObj = {};
    articlesArr.forEach((article) => {
      lookupObj[article.title] = article.article_id;
    });
    return lookupObj;
  }
};
