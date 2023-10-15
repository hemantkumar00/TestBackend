const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  desc: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
    required: true,
  },
  time: String,
  //TODO: Questions Add karna ha.
  question: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  solutionVideo: String,
});

const Test = mongoose.model("Test", testSchema);
module.exports = Test;
