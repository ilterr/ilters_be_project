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
describe("Error testing for non existent endpoint", () => {
  test("404: Attempting to GET a resource when given a non existent endpoint", () => {
    return request(app)
      .get("/api/nonexistent")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found");
      });
  });
});
describe("GET /api", () => {
  test("200: Return documentation detailing my endpoints for the user", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("200: Return article object by it's id, with 8 correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((data) => {
        const articles = data.body.article;
        expect(articles.title).toBe("Living in the shadow of a great man");
        expect(articles.article_id).toBe(1);
        expect(articles.body).toBe("I find this existence challenging");
        expect(articles.topic).toBe("mitch");
        expect(articles.created_at).toBe("2020-07-09T20:11:00.000Z");
        expect(articles.votes).toBe(100);
        expect(articles.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(articles.comment_count).toBe(11);
      });
  });
});
describe("Error testing for /api/articles/:article_id", () => {
  test("400: Attempting to GET a resource by an invalid ID ", () => {
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
  test("200: Returns an array of article objects with 8 properties", () => {
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
          expect(typeof article.comment_count).toBe("number");
        });
      });
  });
});
describe("GET /api/articles QUERIES", () => {
  test("200: default values for sort_by and order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: sort_by sorts the articles by any valid column (article_id)", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  test("200: sort_by sorts the articles by any valid column (topic)", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("topic", { descending: true });
      });
  });
  test("200: order, which can be set to asc", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes");
      });
  });
  test("200: order, which can be set to desc", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("200: topic query filters the articles by topic value cats", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc&topic=cats")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });
  test("200: topic query filters the articles by topic value mitch", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc&topic=mitch")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
});
describe("Error testing for GET /api/articles QUERIES", () => {
  test("400: Attempting to GET a resource with an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("400: Attempting to GET a resource by with an invalid order query", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=abc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("400: Attempting to GET a resource by with an invalid topic query", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc&topic=invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
});
describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with all comments for an article", () => {
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
  test("200: Responds with comments ordered by most recent comment first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toBeSortedBy("created_at");
      });
  });
  test("200: Responds with an empty array if article is valid but there are no comments", () => {
    return request(app)
      .get("/api/articles/8/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toEqual([]);
      });
  });
});
describe("Error testing for GET /api/articles/:article_id/comments", () => {
  test("400: Attempting to GET a resource with an invalid ID ", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("404: Attempting to GET a resource with a valid id that does not exist in the database", () => {
    return request(app)
      .get("/api/articles/12345789/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  test("201: Respond with newly created comment and is retrievable with GET endpoint", () => {
    const commentToAdd = {
      username: "butter_bridge",
      body: "You cheated on me? .. When I specifically asked you not to?",
    };
    return request(app)
      .post("/api/articles/6/comments")
      .send(commentToAdd)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.body).toBe(
          "You cheated on me? .. When I specifically asked you not to?"
        );
        expect(body.comment.author).toBe("butter_bridge");
      });
  });
});

describe("Error testing for POST /api/articles/:article_id/comments ", () => {
  test("404: Attempting to post a comment under valid, but non existent article", () => {
    const commentToAdd = {
      username: "butter_bridge",
      body: "You cheated on me? .. When I specifically asked you not to?",
    };
    return request(app)
      .post("/api/articles/987654/comments")
      .send(commentToAdd)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article not found");
      });
  });
  test("400: Attempting to post a comment under a invalid article", () => {
    const commentToAdd = {
      username: "butter_bridge",
      body: "Northcoders Wooo",
    };
    return request(app)
      .post("/api/articles/invalid/comments")
      .send(commentToAdd)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("400: Attempting to post where username is not valid", () => {
    const commentToAdd = {
      username: "non_existent",
      body: "Michael Scott is the best boss",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(commentToAdd)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: Attempting to post where required fields are missing", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad Request");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  test("200: Article matching id is updated with increased votes", () => {
    const voteToUpdate = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/3")
      .send(voteToUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(10);
        expect(body.article.article_id).toBe(3);
      });
  });
  test("200: Article matching id is updated with decreased votes", () => {
    const voteToUpdate = { inc_votes: -5 };
    return request(app)
      .patch("/api/articles/3")
      .send(voteToUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(-5);
        expect(body.article.article_id).toBe(3);
      });
  });
});
describe("Error testing for PATCH /api/articles/:article_id ", () => {
  test("400: Attempting to GET a resource when the request field is invalid", () => {
    return request(app)
      .patch("/api/articles/1")
      .send("?")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: Attempting to GET a resource when the request field is valid but the value", () => {
    const voteToUpdate = { inc_votes: "word" };
    return request(app)
      .patch("/api/articles/1")
      .send(voteToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("404: Attempting to GET a resource when article is valid but does not exist", () => {
    const voteToUpdate = { inc_votes: 8 };
    return request(app)
      .patch("/api/articles/10000")
      .send(voteToUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("400: Attempting to GET a resource when given an invalid article", () => {
    const voteToUpdate = { inc_votes: 8 };
    return request(app)
      .patch("/api/articles/invalid")
      .send(voteToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("204: Delete the given comment by comment_id", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then(({ res }) => {
        expect(res.statusMessage).toBe("No Content");
      });
  });
});
describe("Error testing for DELETE /api/comments/:comment_id", () => {
  test("404: Attempting to GET a resource when comment does not exist", () => {
    return request(app)
      .delete("/api/comments/9000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
  test("400: Attempting to GET a resource comment is referenced by an invalid ID", () => {
    return request(app)
      .delete("/api/comments/over9000")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an array of objects, each with 3 properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: Responds with a user object with 3 properties", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(body.user.username).toBe("butter_bridge");
        expect(body.user.name).toBe("jonny");
        expect(body.user.avatar_url).toBe(
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
      });
  });
});

describe("Error testing for GET /api/users/:username", () => {
  test("404: Attempting to GET a resource when the username does not exist", () => {
    return request(app)
      .get("/api/users/does_not_exist")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Add votes on a comment when given the comment's id", () => {
    const voteToUpdate = { inc_votes: 5 };
    return request(app)
      .patch("/api/comments/4")
      .send(voteToUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.comment_id).toBe(4);
        expect(body.comment.body).toBe(
          " I carry a log — yes. Is it funny to you? It is not to me."
        );
        expect(body.comment.article_id).toBe(1);
        expect(body.comment.author).toBe("icellusedkars");
        expect(body.comment.votes).toBe(-95);
      });
  });
  test("200: Minus votes on a comment given the comment's id", () => {
    const voteToUpdate = { inc_votes: -3 };
    return request(app)
      .patch("/api/comments/4")
      .send(voteToUpdate)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toBe(-103);
      });
  });
});

describe("Error testing for PATCH /api/comments/:comment_id", () => {
  test("400: Attempting to GET a resource when the body field has an invalid value", () => {
    const voteToUpdate = { inc_votes: "word" };
    return request(app)
      .patch("/api/comments/3")
      .send(voteToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("400: Attempting to GET a resource when the body field is invalid", () => {
    const voteToUpdate = { votes: 2 };
    return request(app)
      .patch("/api/comments/3")
      .send(voteToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
  test("404: Attempting to GET a resource when the comment is valid, but non existent", () => {
    const voteToUpdate = { inc_votes: 8 };
    return request(app)
      .patch("/api/comments/123456789")
      .send(voteToUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
  test("404: Attempting to GET a resource when the comment id is invalid", () => {
    const voteToUpdate = { inc_votes: 8 };
    return request(app)
      .patch("/api/comments/abcd")
      .send(voteToUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Request");
      });
  });
});

describe("POST /api/articles", () => {
  test("200: Add a new article", () => {
    const articleToAdd = {
      title: "Mitch wins gold!",
      topic: "mitch",
      author: "rogersop",
      body: "Mitch has taken the gold at this years annual egg & spoon race!",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(articleToAdd)
      .expect(201)
      .then(({ body }) => {
        expect(body.article.title).toBe("Mitch wins gold!");
        expect(body.article.topic).toBe("mitch");
        expect(body.article.author).toBe("rogersop");
        expect(body.article.body).toBe(
          "Mitch has taken the gold at this years annual egg & spoon race!"
        );
        expect(body.article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(typeof body.article.article_id).toBe("number");
        expect(body.article.votes).toBe(0);
        expect(typeof body.article.created_at).toBe("string");
        expect(body.article.comment_count).toBe(0);
      });
  });
  test("200: Add a new article with default img when no url is given", () => {
    const articleToAdd = {
      title: "Mitch wins gold!",
      topic: "mitch",
      author: "rogersop",
      body: "Mitch has taken the gold at this years annual egg & spoon race!",
    };
    return request(app)
      .post("/api/articles")
      .send(articleToAdd)
      .expect(201)
      .then(({ body }) => {
        expect(body.article.title).toBe("Mitch wins gold!");
        expect(body.article.topic).toBe("mitch");
        expect(body.article.author).toBe("rogersop");
        expect(body.article.body).toBe(
          "Mitch has taken the gold at this years annual egg & spoon race!"
        );
        expect(body.article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(typeof body.article.article_id).toBe("number");
        expect(body.article.votes).toBe(0);
        expect(typeof body.article.created_at).toBe("string");
        expect(body.article.comment_count).toBe(0);
      });
  });
});

describe("Error testing for POST /api/articles", () => {
  test("400: Attempting to GET a resource when the required fields are missing a value", () => {
    const incompleteArr = [
      { title: "", topic: "mitch", author: "rogersop", body: "some content" },
      { title: "Title", topic: "", author: "rogersop", body: "some content" },
      { title: "Title", topic: "mitch", author: "", body: "some content" },
      { title: "Title", topic: "mitch", author: "rogersop", body: "" },
    ];

    return Promise.all(
      incompleteArr.map((articleReq) =>
        request(app)
          .post("/api/articles")
          .send(articleReq)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid Request");
          })
      )
    );
  });
  test("400: Attempting to GET a resource when the required field values are invalid", () => {
    const invalidArr = [
      { titlez: "Title", topic: "mitch", author: "rogersop", body: "content" },
      { title: "Title", topik: "mitch", author: "rogersop", body: "content" },
      { title: "Title", topic: "mitch", auhor: "rogersop", body: "content" },
      { title: "Title", topic: "mitch", author: "rogersop", bodies: "content" },
      { title: "Title", topic: "mitch", author: "rogersop", bodies: "content" },
      {
        title: "Title",
        topic: "mitch",
        author: "rogersop",
        bodies: "content",
        article_img_url: 123,
      },
    ];

    return Promise.all(
      invalidArr.map((articleReq) =>
        request(app)
          .post("/api/articles")
          .send(articleReq)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid Request");
          })
      )
    );
  });
});
