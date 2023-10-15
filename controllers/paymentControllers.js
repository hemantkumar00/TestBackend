const crypto = require("crypto");
const { instance } = require("../app");
const User = require("../models/User");
const TestSeries = require("../models/TestSeries");
const Payment = require("../models/Payment");

module.exports.Checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount) * 100, // Corrected multiplication
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.PaymentVarification = async (req, res) => {
  const { testSeriesId, userId } = req.params;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  generated_signature = hmac_sha256(
    razorpay_order_id + "|" + razorpay_payment_id,
    "EC5qatXC58cAUdesgcUAPhHt",
  );
  const isAuthentic = generated_signature == razorpay_signature;

  try {
    if (isAuthentic) {
      const paymentInfo = await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      const user = await User.findById(userId);
      const testSeries = await TestSeries.findById(testSeriesId);

      // Corrected the way to push data into arrays
      console.log(user);
      user.testSeriesAccess.push({
        testSeries: testSeries,
        payment: paymentInfo,
      });
      // console.log(user);
      await user.save();
      testSeries.usersEnrolled.push(user);
      await testSeries.save();

      // TODO: Multiple things like adding data to payment module, in user, and in testseries
      res.redirect(
        `http://ec2-52-66-120-181.ap-south-1.compute.amazonaws.com/success/${testSeriesId}` ||
          `http://localhost:3000/success/${testSeriesId}`,
      );
    } else {
      res.redirect(
        `http://ec2-52-66-120-181.ap-south-1.compute.amazonaws.com/fail/${testSeriesId}` ||
          `http://localhost:3000/fail/${testSeriesId}`,
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function hmac_sha256(data, key) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(data);
  return hmac.digest("hex");
}

module.exports.ZeroPaymentCheckout = async (req, res) => {
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
