const TestSeries = require("../models/TestSeries");
const User = require("../models/User");
const Payment = require("../models/Payment");
const axios = require("axios");

module.exports.GetAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate({
        path: "testSeriesAccess.testSeries",
        model: "TestSeries",
      })
      .exec();

    if (!users) {
      return res.status(404).json({ error: "No users found" });
    }

    res.status(200).json({ users });
  } catch (e) {
    res.status(500).json({ error: "Some error in fetching user" });
  }
};

module.exports.DeleteTestSeriesFromUser = async (req, res) => {
  const { userId, testSeriesId } = req.params; // Use req.params for route parameters

  // Validate user and testSeriesId
  if (!userId || !testSeriesId) {
    return res.status(400).json({ error: "Invalid user or test series ID" });
  }

  try {
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the test series with the specified ID
    const testSeriesIndex = user.testSeriesAccess.findIndex(
      (access) => access.testSeries.toString() === testSeriesId,
    );

    if (testSeriesIndex === -1) {
      return res
        .status(404)
        .json({ error: "Test series not found for this user" });
    }

    // Remove the test series from the user's testSeriesAccess array
    user.testSeriesAccess.splice(testSeriesIndex, 1);

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Test series deleted successfully" });
  } catch (e) {
    console.error(e); // Log the error for debugging
    res
      .status(500)
      .json({ error: "Some error occurred while processing the request" });
  }
};

module.exports.AddTestSeriesToUser = async (req, res) => {
  const { userId, testSeriesId } = req.params;

  try {
    const user = await User.findById(userId);
    const testSeries = await TestSeries.findById(testSeriesId);

    // Check if the user and test series exist
    if (!user || !testSeries) {
      return res.status(404).json({ error: "User or test series not found" });
    }

    // Check if the test series is already associated with the user
    const isAlreadyEnrolled = user.testSeriesAccess.some(
      (access) => access.testSeries.toString() === testSeriesId,
    );

    if (isAlreadyEnrolled) {
      return res
        .status(400)
        .json({ error: "Test series is already enrolled by the user" });
    }

    // Add the test series to the user's access list
    user.testSeriesAccess.push({
      testSeries: testSeries,
    });
    await user.save();

    // Add the user to the test series's enrolled list
    testSeries.usersEnrolled.push(user);
    await testSeries.save();

    res.status(200).json({ message: "Test series added successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Payment's controllers

module.exports.GetAllPayment = async (req, res) => {
  try {
    // Fetch payments
    const payments = await Payment.find({});

    // Check if there are no payments found
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: "No payments found" });
    }

    // Return the payments
    res.status(200).json({ payments });
  } catch (e) {
    console.error(e);

    // Handle specific error types if needed
    if (e instanceof SomeSpecificError) {
      // Handle the specific error
      return res.status(500).json({ error: "Specific error occurred" });
    }

    // Handle general errors
    res.status(500).json({ error: "Internal server error" });
  }
};

const instance = axios.create({
  baseURL: "https://api.razorpay.com/v1/",
  auth: {
    username: "rzp_test_NKFpEzB6fac5qX",
    password: "EC5qatXC58cAUdesgcUAPhHt",
  },
});

//GetParticular payment with paymentId

module.exports.GetSinglePaymentAmount = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const response = await instance.get(`payments/${paymentId}`);
    const paymentDetails = response.data;
    console.log(paymentDetails);
    res.status(200).json({ amount: paymentDetails.amount });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Admin/User Toggle.

module.exports.AdminUserToggle = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // console.log(req.user._id == userId);

    // Check if the userId is the same as the authenticated user's _id
    if (userId == req.user._id) {
      return res
        .status(400)
        .json({ error: "You cannot change your own role." });
    }

    // Update the user's role
    user.role = role;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Role is changed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};
