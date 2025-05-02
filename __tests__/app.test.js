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
          created_at: expect.any(String),
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
      .get("/api/articles?limit=20") //set limit due to later pagination feature
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
  test("201: Adds comment to the specified article", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "lurker",
        body: "Has anyone heard the rumours?",
      })
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/articles/3/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(3);
          });
      });
  });
  test("201: Returns the comment", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "lurker",
        body: "Has anyone heard the rumours?",
      })
      .expect(201)
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
  test("201: Comment posted if object has too many keys, but includes correct keys", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "lurker",
        body: "Has anyone heard the rumours?",
        testKey: "testValue",
      })
      .expect(201)
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
          created_at: expect.any(String),
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
    test("400: Invalid comment_id used", () => {
      return request(app)
        .delete("/api/comments/invalidCommentId")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
  });
});

describe("GET /api/comments/:comment_id", () => {
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
          created_at: expect.any(String),
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

describe("GET /api/users", () => {
  test("200: Returns an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles?sort_by query", () => {
  describe("Default sorting", () => {
    test("200: Default endpoint sorts by created_at date, in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
          //descending: newest date first
        });
    });
  });

  describe("Specified categories to sort by", () => {
    test("200: Created_at sort specified", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: Votes sort specified", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("votes", { descending: true });
        });
    });
    test("200: Topic sort specified", () => {
      return request(app)
        .get("/api/articles?sort_by=topic")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("topic", { descending: true });
        });
    });
    test("200: Author sort specified", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("author", { descending: true });
        });
    });
    test("200: Title sort specified", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
  });
  describe("Order to sort by specified order", () => {
    test("200: Default sort_by category, but asc order specified", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { ascending: true });
        });
    });
    test("200: Handles upper case order query", () => {
      return request(app)
        .get("/api/articles?order=ASC")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { ascending: true });
        });
    });
    test("200: sort_by specified and asc order specified", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("votes", { ascending: true });
        });
    });
    test("200: sort_by specified and desc order specified", () => {
      return request(app)
        .get("/api/articles?sort_by=title&order=desc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
  });

  describe("Errors", () => {
    test("400: Invalid sort_by category queried", () => {
      return request(app)
        .get("/api/articles?sort_by=invalidCategory")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Invalid order queried", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=invalidOrder")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("401: Existing sort category given, but not a valid option", () => {
      return request(app)
        .get("/api/articles?sort_by=article_img_url")
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
    test("400: Missing sort category", () => {
      return request(app)
        .get("/api/articles?sort_by=")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Missing order specified", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Misspelt 'sort_by'", () => {
      return request(app)
        .get("/api/articles?sort_bye=votes")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid or misspelt query parameter!");
        });
    });
    test("400: Misspelt 'order'", () => {
      return request(app)
        .get("/api/articles?orderrrr=ASC")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid or misspelt query parameter!");
        });
    });
  });
});

describe("GET /api/articles?topic query", () => {
  test("200: Serves array of articles filtered by the topic value specified in the query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(1);
        expect(articles[0]).toMatchObject({
          author: "rogersop",
          title: "UNCOVERED: catspiracy to bring down democracy",
          article_id: 5,
          topic: "cats",
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 2,
        });
      });
  });
  test("200: Handles all three at once: sort_by, topic and order queries - serves an array of articles filtered by the topic value and sorted/ordered when specified", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=title&order=asc&limit=20") //set higher limit due to later pagination feature
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        expect(articles).toBeSortedBy("title", { ascending: true });
      });
  });
  test("200: Topic exists, but there are no articles under this topic - serves an empty array", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(0);
      });
  });
  describe("Errors", () => {
    test("404: Valid topic query does not exist", () => {
      return request(app)
        .get("/api/articles?topic=topicDoesNotExist")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
    test("400: Empty topic query", () => {
      return request(app)
        .get("/api/articles?topic=")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Misspelt 'topic'", () => {
      return request(app)
        .get("/api/articles?topik=cats")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid or misspelt query parameter!");
        });
    });
  });
});

describe("GET /api/articles/:article_id feature update: include comment_count", () => {
  test("200: Responds with an article object for given article id, including comment_count", () => {
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
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 2,
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: Serves a user object for the requested username", () => {
    return request(app)
      .get("/api/users/rogersop")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: "rogersop",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
          name: "paul",
        });
      });
  });
  describe("Errors", () => {
    test("404: Username requested does not exist", () => {
      return request(app)
        .get("/api/users/brucespringsteen")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Updates specified comment with new vote count", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body: { updatedComment } }) => {
        expect(updatedComment).toMatchObject({
          comment_id: 2,
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          created_at: expect.any(String),
          votes: 19,
          author: "butter_bridge",
          article_id: 1,
        });
      });
  });
  describe("Errors", () => {
    test("404: No comment exists with comment_id requested", () => {
      return request(app)
        .patch("/api/comments/500")
        .send({ inc_votes: -13 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });

    test("400: Invalid comment_id used", () => {
      return request(app)
        .patch("/api/comments/invalidCommentId")
        .send({ inc_votes: -13 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Invalid vote modifier sent", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: "cat" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Incorrect key in patch request object", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ wrong_key: 5 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("422: Vote modifier of 0 sent; client alerted to unprocessable entity", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: 0 })
        .expect(422)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unprocessable entity!");
        });
    });
  });
});

describe("POST /api/articles", () => {
  test("201: Adds a new article", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "What was once lost has now been found",
        body: "Has anyone heard the rumours...who says my 90s output was poor?",
        topic: "paper",
        article_img_url:
          "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
      })
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/articles?limit=20") //set higher limit due to later pagination feature
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toHaveLength(14);
          });
      });
  });
  test("201: Returns the article", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "What was once lost has now been found",
        body: "Has anyone heard the rumours...who says my 90s output was poor?",
        topic: "paper",
        article_img_url:
          "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
      })
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle).toMatchObject({
          author: "lurker",
          title: "What was once lost has now been found",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "paper",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
          article_id: 14,
          votes: 0,
          comment_count: 0,
          created_at: expect.any(String),
        });
      });
  });
  test("201: Article posted if object has too many keys, but includes correct keys", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "What was once lost has now been found",
        body: "Has anyone heard the rumours...who says my 90s output was poor?",
        topic: "paper",
        article_img_url:
          "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
        extraKey: "extraString",
      })
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle).toMatchObject({
          author: "lurker",
          title: "What was once lost has now been found",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "paper",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
          article_id: 14,
          votes: 0,
          comment_count: 0,
          created_at: expect.any(String),
        });
      });
  });
  test("201: article_img_url not required to post a new article", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "What was once lost has now been found",
        body: "Has anyone heard the rumours...who says my 90s output was poor?",
        topic: "paper",
      })
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle).toMatchObject({
          author: "lurker",
          title: "What was once lost has now been found",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "paper",
          article_id: 14,
          votes: 0,
          comment_count: 0,
          created_at: expect.any(String),
        });
      });
  });
  describe("Errors", () => {
    test("400: Not all keys present in article object", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "lurker",
          title: "What was once lost has now been found",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Body is empty", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "lurker",
          title: "What was once lost has now been found",
          body: "",
          topic: "paper",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Title is empty", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "lurker",
          title: "",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "paper",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("401: Username does not exist - no account created", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "BSpringsteen49",
          title: "What was once lost has now been found",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "paper",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
        })
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
    test("400: Author is empty", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "",
          title: "What was once lost has now been found",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "paper",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });
    test("400: Topic is empty", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "lurker",
          title: "What was once lost has now been found",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid request!");
        });
    });

    test("401: Topic does not exist yet", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "lurker",
          title: "What was once lost has now been found",
          body: "Has anyone heard the rumours...who says my 90s output was poor?",
          topic: "Springsteen",
          article_img_url:
            "https://cdn-p.smehost.net/sites/e8622626f9584d40b1a8fce8dfa6f567/wp-content/uploads/2025/04/250402-lostbox-cover-feat.jpg",
        })
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
  });
});

describe("GET /api/topics/:slug", () => {
  test("200: Serves topic requested", () => {
    return request(app)
      .get("/api/topics/cats")
      .expect(200)
      .then(({ body: { topic } }) => {
        expect(topic).toMatchObject({
          slug: "cats",
          description: "Not dogs",
          img_url: "",
        });
      });
  });
  describe("Errors", () => {
    test("404: Topic does not exist", () => {
      return request(app)
        .get("/api/topics/topicDoesNotExist")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Not found!");
        });
    });
  });
});

describe("GET /api/articles (pagination)", () => {
  test("200: Serves articles pagination according to limit", () => {
    return request(app)
      .get("/api/articles?limit=9")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(9);
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
  test("200: Serves articles pagination according to limit and start page of 1", () => {
    return request(app)
      .get("/api/articles?limit=9&p=1")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(9);
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

  test("200: Serves articles pagination according to limit and start page greater than 1", () => {
    return request(app)
      .get("/api/articles?limit=5&p=3")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(3); //13 test articles =>page 3 should have 3
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

  describe("Errors", () => {
    test("400: Limit misspelt", () => {
      return request(app)
        .get("/api/articles?limmit=3")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid or misspelt query parameter!");
        });
    });
    test("401: Invalid p; not a number", () => {
      return request(app)
        .get("/api/articles?p=notANumber")
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
    test("401: Invalid p; less than 0", () => {
      return request(app)
        .get("/api/articles?p=-2")
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
    test("401: Invalid limit; not a number", () => {
      return request(app)
        .get("/api/articles?limit=notANumber")
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
    test("401: Invalid limit; less than 1", () => {
      return request(app)
        .get("/api/articles?limit=0")
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Unauthorised request!");
        });
    });
    test("404: Page out of range of results", () => {
      return request(app)
        .get("/api/articles?limit=5&p=20")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("This page does not exist!");
        });
    });
  });
});
