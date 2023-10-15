const express = require("express");
const {
  Register,
  Login,
  Logout,
  UpdateProfile,
  UpdatePassword,
} = require("../controllers/authControllers");
const { body } = require("express-validator");
const passport = require("passport");
const { isAuthenticated, isLoggedIn } = require("../middleware/authMiddleware");

const router = express.Router();

// SIGNUP route

router.post(
  "/signup",
  [
    body("phoneNo").notEmpty().withMessage("Phone number is required."),
    body("username").notEmpty().withMessage("Email is required."),
    body("name").notEmpty().withMessage("Name is required."),
    body("college").notEmpty().withMessage("College is required."),
    body("target").notEmpty().withMessage("Target is required."),
    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/\d/)
      .withMessage("Password must contain at least one digit.")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter."),
  ],
  isAuthenticated,
  Register,
);

// LOGIN route

router.post(
  "/signin",
  [
    body("username").notEmpty().withMessage("Username is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  isAuthenticated,
  Login,
);

//Protected Route

router.get("/user", isLoggedIn, (req, res) => {
  res.status(200).json(req.user);
});

//LOGOUT route

router.get("/signout", isLoggedIn, Logout);

//UPDATE profile

router.put(
  "/update-profile",
  [
    body("phoneNo").notEmpty().withMessage("Phone number is required."),
    body("username").notEmpty().withMessage("Email is required."),
    body("name").notEmpty().withMessage("Name is required."),
    body("college").notEmpty().withMessage("College is required."),
    body("target").notEmpty().withMessage("Target is required."),
  ],
  isLoggedIn,
  UpdateProfile,
);

module.exports = router;
