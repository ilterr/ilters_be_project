const { selectTopics, readDataFile } = require("./models");

exports.getAllTopics = (req, res) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getDocumentation = (req, res, next) => {
  readDataFile()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      if (err.message === "File not found") {
        res.status(404).send({ msg: err.message });
      }
    });
};
