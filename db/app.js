const express = require("express");
const app = express();
const {
  getAllTopics,
  getDocumentation,
  getArticle,
  getAllArticles,
  getComments,
  postComment,
  patchArticle,
} = require("./controllers");
const {
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
} = require("./errors/index.js");

app.use(express.json());

app.get("/api", getDocumentation);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticle);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getComments);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
