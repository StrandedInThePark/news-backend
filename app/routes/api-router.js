const apiRouter = require("express").Router();
const getApi = require("../controllers/api.controllers");

apiRouter.get("/", getApi);

module.exports = apiRouter;
