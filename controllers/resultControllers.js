const User = require("../models/User");
const Test = require("../models/Test");
const Result = require("../models/Result");

module.exports.SubmitResultForTest = async (req, res) => {
  try {
    const { testId, testseriesId, userId } = req.params;
    const result = req.body.result;

    // Find the test by ID and populate its questions
    const test = await Test.findById(testId).populate("question");

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Initialize variables to keep track of marks and results
    let marks = 0;
    let negativeMarks = 0;
    let testTotalMarks = 0;
    let resultObtained = [];

    // Loop through each question in the test
    test.question.forEach((question, index) => {
      // Create an object to store the result for this question
      let questionResult = {
        question: question,
        correctOption: question.correctOpt,
        sellectedOption: [],
        result: "N", // Default to "N" for "Not Attempted"
        marks: 0,
      };

      // Calculate total marks for the test
      testTotalMarks += +question.marks;

      // Add the result object to the resultObtained array
      resultObtained.push(questionResult);
    });

    // Loop through the user's submitted result
    result.forEach((userData, index) => {
      let userSelectedOptions = [];
      let val = true; // Variable to track if all options are correct

      if (userData && userData.selectedOptions) {
        // Sort the selected options
        userData.selectedOptions.sort();
        // Sort the correct options for the question
        test.question[index].correctOpt.sort();

        // Compare user's selected options with correct options
        if (
          userData.selectedOptions.length ===
          test.question[index].correctOpt.length
        ) {
          userData.selectedOptions.forEach((value, key) => {
            userSelectedOptions.push(value + "");
            if (value != test.question[index].correctOpt[key]) {
              // If any option is incorrect, set val to false
              val = false;
            }
          });
        } else {
          val = false;
        }

        if (val) {
          // If all options are correct, add marks
          marks += +test.question[index].marks;
        } else {
          // If any option is incorrect, add negative marks
          negativeMarks += +test.question[index].negative;
        }

        // Update the result for this question
        resultObtained[index].result = val ? "R" : "W";
        resultObtained[index].marks = val
          ? +test.question[index].marks
          : -test.question[index].negative;
      } else {
        // If user didn't attempt the question, mark it as "N" for "Not Attempted"
        resultObtained[index].result = "N";
        resultObtained[index].marks = 0;
      }

      resultObtained[index].sellectedOption = userSelectedOptions;
      console.log(resultObtained[index].selectedOption);
      console.log(userSelectedOptions);
    });

    // Calculate the final marks (subtract negative marks)
    marks -= negativeMarks;

    // Create a new Result instance and save it
    const resultInstance = new Result({
      questionAnswer: resultObtained,
      totalMarks: testTotalMarks,
      optainedMarks: marks,
    });
    const savedResult = await resultInstance.save();

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has completed this test before
    const completedTestIndex = user.completedTest.findIndex((completed) =>
      completed.test.equals(testId),
    );

    // If the test was completed before, remove the previous result
    if (completedTestIndex !== -1) {
      const previousResultId = user.completedTest[completedTestIndex].result;
      await Result.findByIdAndDelete(previousResultId);
      user.completedTest.splice(completedTestIndex, 1);
    }

    // Create a test_result object and push it to the user's completedTest array
    const test_result = {
      test: testId,
      result: savedResult._id,
    };
    user.completedTest.push(test_result);

    // Save the updated user
    await user.save();

    // You can now use the 'marks' and 'resultObtained' for further processing or response.
    res.status(200).json({ message: "Test result submitted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "An error occurred while processing data." });
  }
};

module.exports.ShowResult = async (req, res) => {
  try {
    const { userId, testId } = req.params;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the completedTest by testId
    const completedTest = user.completedTest.find((completedTestItem) =>
      completedTestItem.test.equals(testId),
    );

    if (!completedTest) {
      return res.status(404).json({ error: "Completed test not found" });
    }

    // Find the result by resultId and populate the 'questionAnswer' field
    const result = await Result.findById(completedTest.result).populate({
      path: "questionAnswer.question",
      model: "Question", // Assuming the model name is "Question" for your questions
      match: { _id: { $exists: true } }, // Filter questions that exist (have an _id)
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    // Return the result in the response
    console.log(result);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching data." });
  }
};
