const db = require("../db/connection.js");
const app = require("../db/app.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
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
        expect(response.res.statusMessage).toBe("Not Found");
      });
  });
});
describe("/api", () => {
  test("200: return documentation detailing my endpoints for the user", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
});
describe("/api/articles/:article_id", () => {
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
