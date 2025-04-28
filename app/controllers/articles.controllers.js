const { selectArticleByArticleId } = require("../models/articles.models");

const getArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleByArticleId(article_id).then((articleArr) => {
    if (articleArr.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found!" });
    } else {
      const article = articleArr[0];
      res.status(200).send({ article });
    }
  });
};

module.exports = { getArticleByArticleId };
