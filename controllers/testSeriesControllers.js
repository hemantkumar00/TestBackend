const { validationResult } = require("express-validator");
const TestSeries = require("../models/TestSeries");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

module.exports.CreateTestSeries = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, description, price } = req.body;
    let publicId;

    let imageUrlresult;
    await cloudinary.uploader
      .upload(req.file.path, {
        folder: "test-series",
      })
      .then((data) => {
        imageUrlresult = data.secure_url;
        publicId = data.public_id;
      })
      .catch((e) => {
        console.log(e);
      });

    const testSeries = new TestSeries({
      topic,
      description,
      price,
      image: imageUrlresult,
      publicIdImage: publicId,
    });
    await testSeries.save();

    res.status(201).json({ testSeries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.GetAllTestSeries = async (req, res) => {
  try {
    const testSeries = await TestSeries.find({});

    res.status(200).json({ testSeries });
  } catch (e) {
    res.status(500).json({ error: "Not able to fetch the testSeries" });
  }
};

module.exports.UpdateTestSeries = async (req, res) => {
  try {
    const { testseriesId } = req.params;
    const { topic, description, price } = req.body;

    const testSeries = await TestSeries.findById(testseriesId);

    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    let publicId;
    let imageUrlresult;
    if (req.file && req.file.path) {
      await cloudinary.uploader
        .upload(req.file.path, {
          folder: "test-series",
          public_id: testSeries.publicIdImage,
        })
        .then((data) => {
          imageUrlresult = data.secure_url;
          publicId = data.public_id;
          console.log(data);
        })
        .catch((e) => {
          console.log(e);
        });
      testSeries.image = imageUrlresult;
      testSeries.publicIdImage = publicId;
    }

    testSeries.topic = topic;
    testSeries.description = description;
    testSeries.price = price;

    await testSeries.save();
    res.status(201).json({ testSeries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.DeleteTestSeries = async (req, res) => {
  try {
    const { testseriesId } = req.params;
    // console.log("Deleting test series with ID:", testseriesId);

    const testSeries = await TestSeries.findById(testseriesId);
    if (!testSeries) {
      return res.status(404).json({ message: "Test series not found" });
    }

    if (testSeries.image) {
      // console.log("Deleting image from Cloudinary:", testSeries.publicIdImage);
      await cloudinary.uploader.destroy(testSeries.publicIdImage);
    }
    await TestSeries.findByIdAndDelete(testseriesId);

    res.json({ message: "Test series deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.ToggleActivationTestSeries = async (req, res) => {
  try {
    const { testseriesId } = req.params;

    const testSeries = await TestSeries.findById(testseriesId);
    if (!testSeries) {
      return res.status(404).json({ message: "Not able to find TestSeries" });
    }
    if (testSeries.activation) {
      testSeries.activation = false;
    } else testSeries.activation = true;
    await testSeries.save();
    res.status(201).json({ Message: "Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Show header test-series on the top of home page.

module.exports.ActivateHomePageHeaderTestSeries = async (req, res) => {
  try {
    const { testseriesId } = req.params;

    // Validate the testseriesId parameter
    if (!testseriesId) {
      return res.status(400).json({ message: "Test series ID is required." });
    }

    // Find the test series to activate
    const testSeries = await TestSeries.findById(testseriesId);
    if (!testSeries) {
      return res.status(404).json({ message: "TestSeries not found." });
    }

    // Deactivate any currently activated test series
    const currentlyActivatedSeries = await TestSeries.findOne({
      homePageActivation: true,
    });
    if (currentlyActivatedSeries) {
      currentlyActivatedSeries.homePageActivation = false;
      await currentlyActivatedSeries.save();
    }

    // Activate the selected test series
    testSeries.homePageActivation = true;
    await testSeries.save();

    res.status(200).json({ message: "Test series activated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.GetActivatedHomePageTestSeries = async (req, res) => {
  try {
    const currentlyActivatedSeries = await TestSeries.findOne({
      homePageActivation: true,
    });
    res.status(200).json(currentlyActivatedSeries);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Some error in fetching user" });
  }
};

//Get TestSeries Access to current user.

module.exports.GetAllTestSeriesOfUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId)
      .populate({
        path: "testSeriesAccess.testSeries",
        model: "TestSeries",
      })
      .exec();

    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "No users found" });
    }

    res.status(200).json({ data: user.testSeriesAccess });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Some error in fetching user" });
  }
};
