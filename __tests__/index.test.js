const db = require("../db/connection.js");
const app = require("../db/app.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("200: return an array of topic objects with two properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics.length).toBe(3);
        response.body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});
describe("Error handling check", () => {
  test("404: when given a non existent endpoint", () => {
    return request(app)
      .get("/api/nonexistent")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found");
      });
  });
});
describe("GET /api", () => {
  test("200: return documentation detailing my endpoints for the user", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("200: return article object by it's id, with 8 correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((data) => {
        const articles = data.body.article;
        expect(articles.length).toBe(1);
        expect(articles[0]).toHaveProperty("title");
        expect(articles[0]).toHaveProperty("article_id");
        expect(articles[0]).toHaveProperty("body");
        expect(articles[0]).toHaveProperty("topic");
        expect(articles[0]).toHaveProperty("created_at");
        expect(articles[0]).toHaveProperty("votes");
        expect(articles[0]).toHaveProperty("article_img_url");
      });
  });
});
describe("Error handling for /api/articles/:article_id", () => {
  test("400:Attempting to GET a resource by an invalid ID ", () => {
    return request(app)
      .get("/api/articles/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("404: Attempting to GET a resource by a valid ID that does not exist in the database", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});
describe("GET /api/articles", () => {
  test("200: returns an array of article objects with 8 properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(13);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
        });
      });
  });
});
describe("GET /api/articles/:article_id/comments", () => {
  test("200: respond with all comments for an article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(11);
        response.body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });
      });
  });
  test("respond with comments ordered by most recent comment first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toBeSortedBy("created_at");
      });
  });
});
describe("Error handling for GET /api/articles/:article_id/comments", () => {
  test("400:Attempting to GET comments by an invalid ID ", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("404: Attempting to GET comments by a valid ID that does not exist in the database", () => {
    return request(app)
      .get("/api/articles/12345789/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No comments found");
      });
  });
});
