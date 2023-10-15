const passportLocalMonggose = require("passport-local-mongoose");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phoneNo: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  college: String,
  target: String,

  testSeriesAccess: [
    {
      testSeries: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestSeries",
      },
      payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    },
  ],
  role: String,
  completedTest: [
    {
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      },
      result: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Result",
      },
    },
  ],
  completedTestSeries: String, //TODO: will think about this later.
});
userSchema.plugin(passportLocalMonggose);

const User = mongoose.model("User", userSchema);

module.exports = User;
