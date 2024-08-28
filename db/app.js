const express = require("express");
const app = express();
const { getAllTopics, getDocumentation, getArticle } = require("./controllers");
const {
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
} = require("./errors/index.js");

app.use(express.json());

app.get("/api", getDocumentation);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticle);

app.get("/api/*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});
app.use(handleCustomErrors);
app.use(handleServerErrors);
app.use(handlePsqlErrors);

module.exports = app;
