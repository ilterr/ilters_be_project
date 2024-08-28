const db = require("./connection");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then((topicsData) => {
    return topicsData.rows;
  });
};

exports.readDataFile = () => {
  const filePath = `${__dirname}/../endpoints.json`;
  return fs.readFile(filePath, "utf8").then((fileData) => {
    return JSON.parse(fileData);
  });
};

exports.getArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return data.rows;
    });
};
