const connection = require("./connection");
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
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return data.rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
      COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN  comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC`
    )
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "No articles found" });
      } else return data.rows;
    });
};

exports.selectComments = (article_id) => {
  return exports
    .getArticleById(article_id)
    .then(() => {
      return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC`,
        [article_id]
      );
    })
    .then((data) => {
      return data.rows;
    });
};

exports.addCommentToDatabase = (article_id, username, body) => {
  return exports
    .getArticleById(article_id)
    .then(() => {
      return db.query(
        `INSERT INTO comments (article_id,  author, body)
          VALUES ($1, $2, $3)
          RETURNING *;`,
        [article_id, username, body]
      );
    })
    .then((comment) => {
      return comment.rows[0];
    });
};

exports.amendArticleById = (article_id, inc_votes) => {
  return exports
    .getArticleById(article_id)
    .then(() => {
      return db.query(
        `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
        [inc_votes, article_id]
      );
    })
    .then((response) => {
      return response.rows[0];
    });
};

exports.deleteCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [
      comment_id,
    ])
    .then((response) => {
      if (response.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};
