const db = require("./connection");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then((topicsData) => {
    return topicsData.rows;
  });
};

exports.insertTopic = (slug, description) => {
  if (!slug || !description) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }
  return db
    .query(
      `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;`,
      [slug, description]
    )
    .then((topicData) => {
      return topicData.rows[0];
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

exports.selectArticles = (sort_by = "created_at", order = "desc", topic, limit = 10, p = 1) => {
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

  const parsedLimit = Number(limit);
  const parsedPage = Number(p);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  if (!validSort.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  if (!validOrder.includes(upperCaseOrder)) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  const queryValues = [];
  let whereClause = "";

  if (topic) {
    whereClause = ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  const validateTopic = topic
    ? db
        .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
        .then((topicData) => {
          if (topicData.rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Topic not found" });
          }
        })
    : Promise.resolve();

  return validateTopic.then(() => {
    const countQuery = `SELECT COUNT(*)::INT AS total_count FROM articles${whereClause}`;

    return db.query(countQuery, queryValues).then((countData) => {
      const total_count = countData.rows[0].total_count;

      if (total_count === 0) {
        return Promise.reject({ status: 404, msg: "No articles found" });
      }

      const offset = (parsedPage - 1) * parsedLimit;
      const dataValues = [...queryValues];
      const limitIdx = dataValues.length + 1;
      const offsetIdx = dataValues.length + 2;
      dataValues.push(parsedLimit, offset);

      const queryStr = `
      SELECT
        articles.*,
        COUNT(comments.article_id):: INT AS comment_count
      FROM
        articles
      LEFT JOIN
        comments
      ON
        articles.article_id = comments.article_id${whereClause}
      GROUP BY articles.article_id ORDER BY ${sort_by} ${upperCaseOrder}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

      return db.query(queryStr, dataValues).then((data) => {
        return { articles: data.rows, total_count };
      });
    });
  });
};

exports.selectComments = (article_id, limit = 10, p = 1) => {
  const parsedLimit = Number(limit);
  const parsedPage = Number(p);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return Promise.reject({ status: 400, msg: "Invalid Request" });
  }

  const offset = (parsedPage - 1) * parsedLimit;

  return exports
    .getArticleById(article_id)
    .then(() => {
      return db.query(
        `SELECT COUNT(*)::INT AS total_count FROM comments WHERE article_id = $1`,
        [article_id]
      );
    })
    .then((countData) => {
      const total_count = countData.rows[0].total_count;
      return db
        .query(
          `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
          [article_id, parsedLimit, offset]
        )
        .then((data) => {
          return { comments: data.rows, total_count };
        });
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
