const db = require("./connection");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then((topicsData) => {
    return topicsData.rows;
  });
};

exports.readDataFile = () => {
  const filePath = `${__dirname}/../endpoints.json`;

  return fs
    .readFile(filePath, "utf8")
    .then((fileData) => {
      return JSON.parse(fileData);
    })
    .catch((err) => {
      if (err.code === "ENOENT") {
        throw new Error("File not found");
      }
    });
};
