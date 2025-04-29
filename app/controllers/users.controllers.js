const { selectAllUsers } = require("../models/users.models");

const getAllUsers = (req, res, next) => {
  return selectAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

module.exports = { getAllUsers };
