const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  questionAnswer: [
    {
      question: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
      ],
      correctOption: [],
      sellectedOption: [],
      result: String,
      marks: Number,
    },
  ],
  totalMarks: Number,
  optainedMarks: Number,
});

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
