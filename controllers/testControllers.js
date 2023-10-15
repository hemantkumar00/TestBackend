const Test = require("../models/Test");
const TestSeries = require("../models/TestSeries");

module.exports.GetAllTest = async (req, res) => {
  try {
    const { testSeriesId } = req.params;
    const testSeries = await TestSeries.findById(testSeriesId).populate("test");

    if (!testSeries) {
      return res.status(404).json({ error: "Test series not found." });
    }

    res.status(200).json(testSeries);
  } catch (e) {
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

const videoBaseUrl = "https://www.youtube-nocookie.com/embed/";

module.exports.CreateTest = async (req, res) => {
  const { testSeriesId } = req.params;
  const { name, desc, instruction, time, solutionVideo } = req.body;

  // Check for missing or empty fields
  if (!name || !desc || !instruction || !time) {
    return res.status(400).json({ error: "All fields are mandatory." });
  }

  let videoUrl = "";
  if (solutionVideo) {
    try {
      const videoLink = solutionVideo.split("/");
      const videoId = videoLink[videoLink.length - 1];
      videoUrl = videoBaseUrl + videoId;
    } catch (error) {
      return res.status(400).json({ error: "Invalid solution video URL." });
    }
  }

  try {
    const testSeries = await TestSeries.findById(testSeriesId);

    if (!testSeries) {
      return res.status(404).json({ error: "Test series not found." });
    }

    const test = await Test.create({
      name,
      desc,
      instruction,
      time,
      solutionVideo: videoUrl,
    });
    testSeries.test.push(test);
    await testSeries.save();

    res.status(201).json({ message: "Test created successfully", test });
  } catch (e) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the test." });
  }
};

module.exports.UpdateTest = async (req, res) => {
  const { testId } = req.params;
  const { name, desc, instruction, time, solutionVideo } = req.body;

  // Check for missing or empty fields
  if (!name || !desc || !instruction || !time) {
    return res.status(400).json({ error: "All fields are mandatory." });
  }

  let videoUrl = "";
  if (solutionVideo) {
    try {
      const videoLink = solutionVideo.split("/");
      const videoId = videoLink[videoLink.length - 1];
      videoUrl = videoBaseUrl + videoId;
    } catch (error) {
      return res.status(400).json({ error: "Invalid solution video URL." });
    }
  }

  try {
    const existingTest = await Test.findById(testId);

    if (!existingTest) {
      return res.status(404).json({ error: "Test not found." });
    }

    const updatedTest = await Test.findByIdAndUpdate(
      testId,
      {
        name,
        desc,
        instruction,
        time,
        solutionVideo: videoUrl,
      },
      { new: true },
    );

    if (!updatedTest) {
      return res.status(500).json({ error: "Failed to update the test." });
    }

    res.status(200).json({ message: "Test updated successfully" });
  } catch (e) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the test." });
  }
};

module.exports.DeleteSingleTest = async (req, res) => {
  const { testId, testSeriesId } = req.params;

  try {
    const testSeries = await TestSeries.findById(testSeriesId);

    if (!testSeries) {
      return res.status(404).json({ error: "Test Series not found." });
    }

    const index = testSeries.test.indexOf(testId);
    if (index !== -1) {
      testSeries.test.splice(index, 1);
      await testSeries.save();
    } else {
      return res
        .status(404)
        .json({ error: "Test not found in the test series." });
    }

    const deletedTest = await Test.findByIdAndDelete(testId);
    if (!deletedTest) {
      return res.status(404).json({ error: "Test not found." });
    }

    res.status(200).json({ message: "Test deleted successfully" });
  } catch (e) {
    res.status(500).json({
      error: "An error occurred while deleting the test.",
      details: e.message,
    });
  }
};
