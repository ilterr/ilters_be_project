exports.handleCustomErrors = (err, req, res, next) => {
  // console.log(err, "<-- ended up in handleCustomErrors");
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  // console.log(err.code, "<-- ended up in handlePsqlErrors");
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Request" });
  } else next(err);
};

exports.handleServerErrors = (err, req, res) => {
  // console.log(err, "<- ended up in handleServerErrors"
  res.status(500).send({ msg: "Internal Server Error" });
};
