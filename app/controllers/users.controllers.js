const {
  selectAllUsers,
  selectUserByUsername,
} = require("../models/users.models");

const getAllUsers = (req, res, next) => {
  return selectAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

const getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  return selectUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

module.exports = { getAllUsers, getUserByUsername };
