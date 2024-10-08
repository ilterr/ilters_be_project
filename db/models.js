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
    .query(
      `
      SELECT 
        articles.*, 
        COUNT(comments.comment_id):: INT AS comment_count
      FROM 
        articles
      LEFT JOIN 
        comments 
      ON 
        articles.article_id = comments.article_id
      WHERE 
        articles.article_id = $1
      GROUP BY 
        articles.article_id     
    `,
      [article_id]
    )
    .then((data) => {
      const [article] = data.rows;
      if (!article) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return data.rows[0];
    });
};

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  const upperCaseOrder = order.toUpperCase();
  const validSort = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["ASC", "DESC"];
  const validTopic = ["mitch", "cats"];

  if (!validSort.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  if (!validOrder.includes(upperCaseOrder)) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  if (topic && !validTopic.includes(topic)) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  let queryStr = `
  SELECT 
    articles.*, 
    COUNT(comments.article_id):: INT AS comment_count 
  FROM 
    articles 
  LEFT JOIN  
    comments 
  ON 
    articles.article_id = comments.article_id`;

  const queryValues = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryStr += `
  GROUP BY articles.article_id ORDER BY ${sort_by} ${upperCaseOrder}
  `;

  return db.query(queryStr, queryValues).then((data) => {
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

exports.insertComment = (article_id, username, body) => {
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

exports.updateArticleById = (article_id, inc_votes) => {
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

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users`).then((usersData) => {
    return usersData.rows;
  });
};

exports.selectUserByName = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then((userData) => {
      if (userData.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return userData.rows[0];
    });
};

exports.updateCommentById = (comment_id, inc_votes) => {
  if (typeof inc_votes !== "number") {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,
      [inc_votes, comment_id]
    )
    .then((commentData) => {
      if (commentData.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
      return commentData.rows[0];
    });
};

exports.insertArticle = (
  author,
  title,
  body,
  topic,
  article_img_url = "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
) => {
  if (!author || !title || !body || !topic) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }
  return db
    .query(
      `INSERT INTO 
        articles (author, title, body, topic, article_img_url, created_at) 
       VALUES 
        ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *;`,
      [author, title, body, topic, article_img_url]
    )
    .then((article) => {
      const newArticle = article.rows[0];
      return db.query(
        `SELECT 
        articles.*, 
      COUNT
        (comments.article_id)::INT AS comment_count
      FROM 
        articles 
      LEFT JOIN 
        comments ON articles.article_id = comments.article_id
      WHERE 
        articles.article_id = $1
      GROUP BY 
        articles.article_id;`,
        [newArticle.article_id]
      );
    })
    .then((response) => {
      return response.rows[0];
    });
};
