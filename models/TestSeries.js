const mongoose = require("mongoose");

const testSeriesSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  publicIdImage: String,
  homePageActivation: {
    type: Boolean,
    default: false,
  },
  test: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
  ],
  usersEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  activation: Boolean,
  //TODO: user enrolment and tests involved
});

const TestSeries = mongoose.model("TestSeries", testSeriesSchema);

module.exports = TestSeries;
