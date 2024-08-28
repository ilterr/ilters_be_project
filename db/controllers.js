// const articles = require("./data/test-data/articles");
const { selectTopics, readDataFile, getArticleById } = require("./models");

exports.getAllTopics = (req, res) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getDocumentation = (req, res, next) => {
  readDataFile()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  getArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
