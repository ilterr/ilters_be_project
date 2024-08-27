const express = require("express");
const app = express();
const { getAllTopics, getDocumentation } = require("./controllers");

app.get("/api", getDocumentation);

app.get("/api/topics", getAllTopics);

module.exports = app;
