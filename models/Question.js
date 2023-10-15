const mongoose = require("mongoose");

const questionsSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  // desc: {
  //   type: String,
  //   trim: true,
  //   required: true,
  // },
  options: {
    type: [String],
    trim: true,
    validate: {
      validator: function (v) {
        return v.length >= 1;
      },
      message: "Options must have at least one element.",
    },
  },
  correctOpt: {
    type: [String],
    trim: true,
    validate: {
      validator: function (v) {
        return v.length >= 1;
      },
      message: "Correct options must have at least one element.",
    },
  },
  marks: {
    type: String,
    required: true,
    trim: true,
  },
  negative: {
    type: String,
    trim: true,
  },
  rational: {
    type: String,
  },
  image: {
    type: String,
  },
  solution: {
    type: String,
  },
  publicIdImage: String,
});

const Question = mongoose.model("Question", questionsSchema);
module.exports = Question;
