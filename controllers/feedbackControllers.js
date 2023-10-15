const Feedback = require("../models/FeedBack");

module.exports.AddFeedback = async (req, res) => {
  // Check for validation errors

  const { user, email, message } = req.body;

  try {
    const feedback = new Feedback({
      name: user,
      email: email,
      message: message,
      active: true,
    });

    await Feedback.create(feedback);

    return res
      .status(200)
      .json({ message: "Thanks for your valuable feedback" });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all feedback
module.exports.GetAllFeedBack = async (req, res) => {
  try {
    const feedback = await Feedback.find({});
    return res.status(200).json(feedback);
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all active feedback
module.exports.GetAllActiveFeedBack = async (req, res) => {
  try {
    const feedback = await Feedback.find({ active: true }); // Assuming 'active' is a field in the Feedback model
    return res.status(200).json(feedback);
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.ToggleActivation = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findById(feedbackId);
    feedback.active = !feedback.active;
    await feedback.save();
    return res.status(200).json({ message: "Update successfully" });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
