const db = require("../db/connection.js");
const app = require("../db/app.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
  it("should return a 200 status code and an array of topic objects with two properties", () => {
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
  it("should return 404 when given a non existent endpoint", () => {
    return request(app)
      .get("/api/nonexistent")
      .expect(404)
      .then((response) => {
        expect(response.res.statusMessage).toBe("Not Found");
      });
  });
});
