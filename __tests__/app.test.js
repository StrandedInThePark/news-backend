const endpointsJson = require("../endpoints.json");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const request = require("supertest");
const app = require("../app.js");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /* all other urls", () => {
  test("404: Responds with invalid URL for anything else not caught by other endpoints", () => {
    return request(app)
      .get("/api/non-existent-endpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid URL!");
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of all topics with slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article object for given article id", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: `2020-11-03T09:12:00.000Z`,
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  describe("Errors", () => {
    test("404: Valid id that does not exist", () => {
      return request(app)
        .get("/api/articles/2000")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
    test("400: Invalid id; not a number", () => {
      return request(app)
        .get("/api/articles/not-a-number")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of all articles as objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        articles.forEach((article) =>
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          })
        );
      });
  });
  test("200: Array is ordered by ascending date of article creation", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Retrieves all comments for specified article, in an array", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  test("200: Comments are ordered with most recent comments first", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("200: Article exists but there are no comments, receives empty array", () => {
    return request(app)
      .get("/api/articles/10/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  describe("Errors", () => {
    test("400: Invalid article ID; not a number", () => {
      return request(app)
        .get("/api/articles/not-a-number/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("404: Non-existent article ID; valid request", () => {
      return request(app)
        .get("/api/articles/1313/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("200: Adds comment to the specified article", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "lurker",
        body: "Has anyone heard the rumours?",
      })
      .expect(200)
      .then(() => {
        return request(app)
          .get("/api/articles/3/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(3);
          });
      });
  });
  test("200: Returns the comment", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "lurker",
        body: "Has anyone heard the rumours?",
      })
      .expect(200)
      .then(({ body: { newComment } }) => {
        expect(newComment).toMatchObject({
          comment_id: 19,
          article_id: 3,
          author: "lurker",
          body: "Has anyone heard the rumours?",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
  describe("Errors", () => {
    test("404: Specified article does not yet exist", () => {
      return request(app)
        .post("/api/articles/302/comments")
        .send({
          username: "lurker",
          body: "Has anyone heard the rumours?",
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
    test("400: Invalid article id used", () => {
      return request(app)
        .post("/api/articles/invalidArticleId/comments")
        .send({
          username: "lurker",
          body: "Has anyone heard the rumours?",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Too many keys", () => {
      return request(app)
        .post("/api/articles/invalidArticleId/comments")
        .send({
          username: "lurker",
          body: "Has anyone heard the rumours?",
          testKey: "testValue",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Not all keys present in comment object", () => {
      return request(app)
        .post("/api/articles/3/comments")
        .send({
          username: "lurker",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Body of message is empty", () => {
      return request(app)
        .post("/api/articles/3/comments")
        .send({
          username: "lurker",
          body: "",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("401: Username does not exist - no account created", () => {
      return request(app)
        .post("/api/articles/3/comments")
        .send({
          username: "Springsteen49",
          body: "Hey guys, I've announced 7 lost albums in June, head over to BTX for a laugh.",
        })
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Updates specified article with new vote count", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -13 })
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 87,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  describe("Errors", () => {
    test("404: No article exists with article_id requested", () => {
      return request(app)
        .patch("/api/articles/500")
        .send({ inc_votes: -13 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
  });
  test("400: Invalid article id used", () => {
    return request(app)
      .patch("/api/articles/invalidArticleId")
      .send({ inc_votes: -13 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid request!");
      });
  });

  test("400: Invalid vote modifier sent", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "cat" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid request!");
      });
  });
  test("400: Incorrect key in patch request object", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ wrong_key: 5 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid request!");
      });
  });
  test("422: Vote modifier of 0 sent; client alerted to unprocessable entity", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 0 })
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Unprocessable entity!");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("200: Deletes specified comment", () => {
    return request(app)
      .delete("/api/comments/2")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(10);
          });
      });
  });

  describe("Errors", () => {
    test("404: Comment_id is valid but does not exist", () => {
      return request(app)
        .delete("/api/comments/203")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
    test.todo("invalid comment id");
  });
});

describe.only("GET /api/comments/:comment_id", () => {
  test("200: Returns specified comment", () => {
    return request(app)
      .get("/api/comments/2")
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 2,
          article_id: 1,
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          votes: 14,
          author: "butter_bridge",
          created_at: "2020-10-31T03:03:00.000Z",
        });
      });
  });
  describe("Errors", () => {
    test("404: Comment_id does not exist", () => {
      return request(app)
        .get("/api/comments/2000")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
    test("400: Invalid comment_id", () => {
      return request(app)
        .get("/api/comments/invalidCommentId")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
  });
});
