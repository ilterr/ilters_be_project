exports.handleCustomErrors = (err, req, res, next) => {
  // console.log(err, "<-- ended up in handleCustomErrors");
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  // console.log(err, "<-- ended up in handlePsqlErrors");
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Request" });
  }
  if (err.code === "23503" || err.code === "23502") {
    res.status(400).send({ msg: "Bad Request" });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  // console.log(err, "<- ended up in handleServerErrors"
  res.status(500).send({ msg: "Internal Server Error" });
};
