const express = require("express");
const app = express();
const {
  getAllTopics,
  getDocumentation,
  getArticle,
  getAllArticles,
  getComments,
} = require("./controllers");
const {
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
} = require("./errors/index.js");

const port = process.env.PORT || 9090;

app.use(express.json());

app.get("/api", getDocumentation);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticle);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getComments);

app.get("/api/*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});
app.use(handleCustomErrors);
app.use(handleServerErrors);
app.use(handlePsqlErrors);

module.exports = app;
