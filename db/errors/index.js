exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    console.log("<---- custom err");
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  if (err.code === "ENOENT") {
    res.status(404).send({ msg: "Not Found" });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
};
