const { validationResult } = require("express-validator");
const User = require("../models/User");
const passport = require("passport");

module.exports.Register = async (req, res) => {
  const {
    phoneNo,
    username,
    password,
    name,
    college,
    target,
    role = "User",
  } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = new User({
    username: username,
    name: name,
    phoneNo: phoneNo,
    college: college,
    target: target,
    role: role,
  });
  try {
    await User.register(user, password);
    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.Login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // If the validation passes, proceed with authentication
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If authentication succeeds, manually log the user in
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // Return a success response
      return res.status(200).json({
        message: "Login Successful",
        user: {
          _id: user._id,
          phoneNo: user.phoneNo,
          name: user.name,
          college: user.college,
          target: user.target,
          username: user.username,
        },
      });
    });
  })(req, res, next);
};

module.exports.Logout = (req, res) => {
  req.logOut((err) => {
    if (err) req.status(400).json({ message: "some error in logout" });
    res.status(200).json({ message: "Hope to see you soon" });
  });
};

module.exports.UpdateProfile = async (req, res) => {
  const { user, userId } = req.body;
  try {
    const currentUser = await User.findById(userId);

    // Update the properties of currentUser based on the user object
    currentUser.name = user.name;
    currentUser.phoneNo = user.phoneNo;
    currentUser.college = user.college;
    currentUser.target = user.target;

    await currentUser.save();
    res.status(200).json({ message: "Profile is saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//TODO: Update Password
