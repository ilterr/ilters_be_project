const express = require("express");
const app = express();
const { getAllTopics, getDocumentation, getArticle } = require("./controllers");
const { handleCustomErrors, handleServerErrors } = require("./errors/index.js");

app.get("/api", getDocumentation);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticle);

app.use(handleCustomErrors);
app.use(handleServerErrors);
module.exports = app;
