const handlePSQLErrors = (err, req, res, next) => {
  // console.log(err, "error log");
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid request!" });
  }
  if (err.code === "23503") {
    res.status(401).send({ msg: "Unauthorised request!" });
  } else {
    next(err);
  }
};

const handleCustomErrors = (err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

const catchAllErrors = (err, req, res) => {
  console.log(err, "Error has not been handled yet!");
  res.status(500).send({ msg: "Internal server error!" });
};

module.exports = { handlePSQLErrors, handleCustomErrors, catchAllErrors };
